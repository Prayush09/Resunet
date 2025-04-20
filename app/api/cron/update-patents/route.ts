import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { db } from "@/lib/db"

// This route should be protected with a secret key in production
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get("key")
    
    // In production, verify a secret key
    // Remember to change the link in package.json when in production
    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get all users with Google Scholar URLs
    const users = await db.user.findMany({
      where: {
        googleScholarUrl: {
          not: null,
        },
      },
      select: {
        id: true,
        googleScholarUrl: true,
      },
    })
    
    if (users.length === 0) {
      return NextResponse.json({ message: "No users with Google Scholar URLs found" })
    }
    
    const results = []
    
    
    for (const user of users) {
      if (!user.googleScholarUrl) continue
      try {
        const patents = await fetchPatentsFromGoogleScholar(user.googleScholarUrl)
        if (patents && patents.length > 0) {
          await db.patent.deleteMany({
            where: {
              userId: user.id,
            },
          })
          
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
          
          results.push({
            userId: user.id,
            success: true,
            count: patents.length,
          })
        } else {
          results.push({
            userId: user.id,
            success: false,
            error: "No patents found",
          })
        }
      } catch (error) {
        console.error(`Error updating patents for user ${user.id}:`, error)
        results.push({
          userId: user.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      processed: users.length,
      results,
    })
  } catch (error) {
    console.error("Error in cron update patents route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

async function fetchPatentsFromGoogleScholar(scholarUrl: string) {
  try {
    const userIdMatch = scholarUrl.match(/user=([^&]+)/)
    if (!userIdMatch || !userIdMatch[1]) {
      throw new Error("Invalid Google Scholar URL")
    }
    
    const userId = userIdMatch[1]
    
    const patentsUrl = `https://scholar.google.com/citations?view_op=list_works&user=${userId}&mauthors=patent`
    
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
    //@ts-ignore
    const patents = []
    
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
    //@ts-ignore
    return patents
  } catch (error) {
    console.error("Error fetching patents from Google Scholar:", error)
    throw error
  }
}
