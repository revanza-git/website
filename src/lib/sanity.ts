import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// Define proper types for Sanity image
interface SanityImageAsset {
	_type: "image";
	asset: {
		_ref: string;
		_type: "reference";
	};
	alt?: string;
}

// Define proper types for Sanity portable text
interface SanityBlock {
	_type: "block";
	_key: string;
	style?: string;
	children?: Array<{
		_type: "span";
		_key: string;
		text: string;
		marks?: string[];
	}>;
}

export interface Post {
	_id: string;
	title: string;
	slug: { current: string };
	mainImage?: SanityImageAsset;
	publishedAt: string;
	excerpt?: string;
	body: SanityBlock[];
}

export const client = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: import.meta.env.SANITY_DATASET || "production",
	apiVersion: "2024-03-19",
	useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageAsset) {
	return builder.image(source);
}

export async function getPosts(): Promise<Post[]> {
	return await client.fetch(
		`*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      body
    }`,
	);
}

export async function getPost(slug: string): Promise<Post> {
	return await client.fetch(
		`*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      body
    }`,
		{ slug },
	);
}
