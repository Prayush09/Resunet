import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import * as cheerio from "cheerio"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with Google Scholar URL
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user || !user.googleScholarUrl) {
      return NextResponse.json(
        { error: "Google Scholar URL not set in your profile" },
        { status: 400 }
      )
    }

    // Fetch patents from Google Scholar
    const patents = await fetchPatentsFromGoogleScholar(user.googleScholarUrl)

    if (!patents || patents.length === 0) {
      return NextResponse.json(
        { error: "No patents found or unable to parse Google Scholar page" },
        { status: 404 }
      )
    }

    // Delete existing patents for this user
    await db.patent.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Create new patents
    await db.patent.createMany({
      data: patents.map(patent => ({
        userId: user.id,
        title: patent.title,
        authors: patent.authors,
        publicationDate: patent.publicationDate,
        patentNumber: patent.patentNumber,
        abstract: patent.abstract,
        url: patent.url,
        citations: patent.citations,
      })),
    })

    return NextResponse.json({ 
      success: true, 
      message: `Successfully refreshed ${patents.length} patents` 
    })
  } catch (error) {
    console.error("Error in refresh patents route:", error)
    return NextResponse.json({ 
      error: "Failed to refresh patents. Please check your Google Scholar URL and try again." 
    }, { status: 500 })
  }
}

async function fetchPatentsFromGoogleScholar(scholarUrl: string) {
  try {
    // Extract user ID from Google Scholar URL
    const userIdMatch = scholarUrl.match(/user=([^&]+)/)
    if (!userIdMatch || !userIdMatch[1]) {
      throw new Error("Invalid Google Scholar URL")
    }
    
    const userId = userIdMatch[1]
    
    // Construct the URL to fetch patents
    // Note: We're specifically looking for patents in the user's profile
    const patentsUrl = `https://scholar.google.com/citations?view_op=list_works&user=${userId}&mauthors=patent`
    
    // Fetch the HTML content
    const response = await fetch(patentsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Scholar page: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    // Parse the HTML to extract patent information
    const $ = cheerio.load(html)
    const patents: {
      title: string;
      authors: string;
      publicationDate: string | null;
      patentNumber: string | null;
      url: string;
      citations: number;
      abstract: string | null;
    }[] = []
    
    // Each patent is in a tr.gsc_a_tr element
    //@ts-ignore
    $('.gsc_a_tr').each((i, element) => {
      const titleElement = $(element).find('.gsc_a_at')
      const title = titleElement.text().trim()
      const url = 'https://scholar.google.com' + titleElement.attr('href')
      
      const authors = $(element).find('.gs_gray').first().text().trim()
      const venueAndYear = $(element).find('.gs_gray').last().text().trim()
      
      // Extract patent number and publication date
      const patentMatch = venueAndYear.match(/Patent\s*([\w\d\s.,/-]+)/)
      const patentNumber = patentMatch ? patentMatch[1].trim() : null
      
      const yearElement = $(element).find('.gsc_a_y')
      const publicationDate = yearElement.text().trim()
      
      const citationsElement = $(element).find('.gsc_a_ac')
      const citationsText = citationsElement.text().trim()
      const citations = citationsText ? parseInt(citationsText, 10) : 0
      
      patents.push({
        title,
        authors,
        publicationDate,
        patentNumber,
        url,
        citations,
        abstract: null, // We would need to visit each patent page to get the abstract
      })
    })
    
    return patents
  } catch (error) {
    console.error("Error fetching patents from Google Scholar:", error)
    throw error
  }
}
