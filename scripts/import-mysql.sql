\set ON_ERROR_STOP on

BEGIN;
SET LOCAL TIME ZONE 'UTC';

LOCK TABLE public.users, public.defis, public.videos, public.comments, public.distribution,
  public.liked, public.saved, public.sessions, public.subscription, public.password_reset_tokens
  IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.users UNION ALL SELECT 1 FROM public.defis
    UNION ALL SELECT 1 FROM public.videos UNION ALL SELECT 1 FROM public.comments
    UNION ALL SELECT 1 FROM public.distribution UNION ALL SELECT 1 FROM public.liked
    UNION ALL SELECT 1 FROM public.saved UNION ALL SELECT 1 FROM public.sessions
    UNION ALL SELECT 1 FROM public.subscription UNION ALL SELECT 1 FROM public.password_reset_tokens
  ) THEN
    RAISE EXCEPTION 'The PostgreSQL import target must be empty';
  END IF;
END
$$;

\copy public.users (user_id, user_username, user_email, user_password, user_lastname, user_firstname, user_birthday, user_status, user_cgu, user_email_verify, user_email_verify_expires, user_suspended, user_admin, user_profile_picture, user_banner, user_name, user_website, user_bio) FROM 'users.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.defis (defi_id, defi_name, defi_description, defi_timestamp, defi_image, defi_user_id, defi_verified, defi_current, defi_date_end) FROM 'defis.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.videos (video_id, video_url, video_vimeo_id, video_title, video_user_id, video_synopsis, video_poster, video_genre, video_defi_id, video_duration, video_like_number, video_date, video_report_id) FROM 'videos.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.comments (comment_id, comment_content, comment_video_id, comment_user_id, comment_date, comment_report_id) FROM 'comments.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.distribution (distribution_user_id, distribution_video_id) FROM 'distribution.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.liked (liked_user_id, liked_video_id) FROM 'liked.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.saved (saved_user_id, saved_video_id) FROM 'saved.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.sessions (sessions_userid, sessions_token, sessions_serial, sessions_date) FROM 'sessions.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.subscription (subscription_id, subscription_subscriber_id, subscription_artist_id) FROM 'subscription.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
\copy public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM 'password_reset_tokens.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')

CREATE TEMP TABLE mysql_sequences (
  table_name text PRIMARY KEY,
  next_id integer NOT NULL CHECK (next_id > 0)
) ON COMMIT DROP;
\copy mysql_sequences (table_name, next_id) FROM 'sequences.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')

DO $$
DECLARE
  identity_column record;
  source_next_id bigint;
  next_identity bigint;
BEGIN
  IF (SELECT count(*) FROM mysql_sequences) <> 6 THEN
    RAISE EXCEPTION 'Expected six MySQL AUTO_INCREMENT values';
  END IF;

  FOR identity_column IN
    SELECT * FROM (VALUES
      ('users', 'user_id'), ('defis', 'defi_id'), ('videos', 'video_id'),
      ('comments', 'comment_id'), ('subscription', 'subscription_id'), ('password_reset_tokens', 'id')
    ) AS identities(table_name, column_name)
  LOOP
    SELECT next_id INTO STRICT source_next_id
      FROM mysql_sequences WHERE table_name = identity_column.table_name;

    EXECUTE format('SELECT greatest($1, max(%I)::bigint + 1) FROM public.%I',
                   identity_column.column_name, identity_column.table_name)
      INTO next_identity USING source_next_id;

    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I RESTART WITH %s',
                   identity_column.table_name, identity_column.column_name, next_identity);
  END LOOP;
END
$$;

COMMIT;
