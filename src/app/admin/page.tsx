import { requireAdmin } from '@/lib/session'
import { db } from '@/lib/db'
import { users, videos, defis, comments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Nav from '@/components/Nav'
import AdminDashboard from './AdminDashboard'
import '@/styles/fil_actu.css'
import '@/styles/admin.css'

export default async function AdminPage() {
    const session = await requireAdmin()

    // Fetch profile pic for nav
    const [navUser] = await db
        .select({ pic: users.user_profile_picture })
        .from(users)
        .where(eq(users.user_id, session.userId))
        .limit(1)
    const profilePic = navUser?.pic ?? ''

    // Parallel fetch: all users, videos+defi, defis+user, comments+video+user
    const [allUsers, allVideos, allDefis, allComments] = await Promise.all([
        db.select({
            user_id: users.user_id,
            user_lastname: users.user_lastname,
            user_firstname: users.user_firstname,
            user_username: users.user_username,
            user_email: users.user_email,
            user_birthday: users.user_birthday,
            user_suspended: users.user_suspended,
        }).from(users),

        db.select({
            video_id: videos.video_id,
            video_url: videos.video_url,
            video_title: videos.video_title,
            user_username: users.user_username,
            video_synopsis: videos.video_synopsis,
            video_genre: videos.video_genre,
            defi_name: defis.defi_name,
            video_date: videos.video_date,
            video_like_number: videos.video_like_number,
        })
            .from(videos)
            .leftJoin(users, eq(users.user_id, videos.video_user_id))
            .leftJoin(defis, eq(defis.defi_id, videos.video_defi_id)),

        db.select({
            defi_id: defis.defi_id,
            defi_name: defis.defi_name,
            defi_description: defis.defi_description,
            defi_timestamp: defis.defi_timestamp,
            defi_date_end: defis.defi_date_end,
            user_username: users.user_username,
            defi_verified: defis.defi_verified,
            defi_current: defis.defi_current,
        })
            .from(defis)
            .leftJoin(users, eq(users.user_id, defis.defi_user_id)),

        db.select({
            comment_id: comments.comment_id,
            comment_content: comments.comment_content,
            comment_date: comments.comment_date,
            video_title: videos.video_title,
            user_username: users.user_username,
        })
            .from(comments)
            .leftJoin(videos, eq(videos.video_id, comments.comment_video_id))
            .leftJoin(users, eq(users.user_id, comments.comment_user_id)),
    ])

    // Serialize datetime fields to strings for client component
    function serializeVideos(rows: typeof allVideos) {
        return rows.map(v => ({
            ...v,
            video_date: v.video_date instanceof Date ? v.video_date.toISOString() : (v.video_date ?? null),
        }))
    }

    function serializeDefis(rows: typeof allDefis) {
        return rows.map(d => ({
            ...d,
            defi_timestamp: d.defi_timestamp instanceof Date ? d.defi_timestamp.toISOString() : (d.defi_timestamp ?? null),
        }))
    }

    function serializeComments(rows: typeof allComments) {
        return rows.map(c => ({
            ...c,
            comment_date: c.comment_date instanceof Date ? c.comment_date.toISOString() : (c.comment_date ?? null),
        }))
    }

    return (
        <main className="main_content">
            <Nav user={session} profilePic={profilePic} />

            <h1 className="back_office_title">BACK-OFFICE</h1>

            <AdminDashboard
                users={allUsers}
                videos={serializeVideos(allVideos)}
                defis={serializeDefis(allDefis)}
                comments={serializeComments(allComments)}
            />
        </main>
    )
}
