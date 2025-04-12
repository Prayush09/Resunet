import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabeledInput} from "@/components/ui/input";


//Created a basic profile page that displays the user's name, email, and image URL. 
//Modify this to include additional user information as needed.
//You can also add functionality to update the user's profile information.
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>You must be signed in to view this page.</p>;
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return <p>User not found.</p>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <LabeledInput
                label="Name"
                value={user.name}
                disabled
                className="mb-4"
              />
              <LabeledInput
                label="Email"
                value={user.email}
                disabled
                className="mb-4"
              />
              <LabeledInput
                label="Image URL"
                value={user.image || ""}
                disabled
                className="mb-4"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
