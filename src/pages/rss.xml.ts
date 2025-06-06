import RSS from "rss";
import type { FeedOptions, ItemOptions } from "rss";
import { getPosts } from "../lib/sanity";

const SITE_URL = import.meta.env.SITE_URL || "http://localhost:4321";
const FEED_URL = import.meta.env.FEED_URL || `${SITE_URL}/rss.xml`;
const BLOG_URL = import.meta.env.BLOG_URL || `${SITE_URL}/blog`;

export async function GET() {
	const posts = await getPosts();

	const feedOptions: FeedOptions = {
		title: "Revanza's blog",
		description: "Cool Stuff I write",
		site_url: SITE_URL,
		feed_url: FEED_URL,
		language: "en",
	};

	const feed = new RSS(feedOptions);

	for (const post of posts) {
		const itemOptions: ItemOptions = {
			title: post.title,
			description: post.excerpt || "",
			url: `${BLOG_URL}/${post.slug.current}`,
			date: post.publishedAt,
		};
		feed.item(itemOptions);
	}

	return new Response(feed.xml({ indent: true }), {
		headers: {
			"Content-Type": "application/xml",
		},
	});
}
