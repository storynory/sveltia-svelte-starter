What you get for every collection
Folder collections (have folder: in config.yml)

For a collection called posts, you get:

getPosts() → all items

getPost(slug) → one item or null

Same pattern for any folder collection:

people → getPeople(), getPerson(slug)

podcasts → getPodcasts(), getPodcast(slug)

etc.

Each returned item always has:

slug (from filename)

body (markdown content, even if empty)

excerpt (first 200 chars of body)

Plus whatever fields are in your config.

Files collections (have files: in config.yml)

For settings with a doc site, you get:

getSettingsSite() (name is get + CollectionName + DocName)

Draft filtering

If a collection has a boolean draft field or a string status field, then:

getX() returns only published by default

use { includeDrafts: true } to include drafts

Examples:

const posts = await getPosts(); // drafts filtered (if draft/status exists)
const allPosts = await getPosts({ includeDrafts: true });


If your collection does not have draft or status, there’s no options object at all (simpler signature).

Images

No with: needed.

Your image fields are just strings (paths/URLs) coming from frontmatter, eg:

post.featuredImage // "/uploads/whatever.jpg"
person.photo // "/uploads/person.webp"


So “getting an image” just means reading the string and using your Picture component (or <img>).

Joins (relations)

The generator creates join helpers only when you have a relation field in config.yml.

Example: if posts has a relation field like:

- name: tags
  widget: relation
  collection: tags
  multiple: true


Then you’ll have a helper:

joinPostsWithTags(posts, tags)

Usage:

import { getPosts, getTags, joinPostsWithTags } from '$lib/server/content/api.generated';

const posts = await getPosts();
const tags = await getTags();
const postsWithTags = joinPostsWithTags(posts, tags);

// each post now has `tagsObjects`
console.log(postsWithTags[0].tagsObjects);

Can you join a person?

Yes — as long as you model it as a relation.

For example, in posts config:

- name: author
  widget: relation
  collection: people
  multiple: false


Then you’ll get:

joinPostsWithPeople(posts, people)

and each post will get:

authorObjects (singular relation still uses that naming in the current generator)

If you prefer it to be called authorObject for singular relations, that’s a tiny naming tweak we can make later, but it works as-is.

The “with:” question

Right now: no. There is no with: option in this version.

You explicitly do joins by calling the join helper (keeps the generator simple and predictable):

const posts = await getPosts();
const people = await getPeople();
const joined = joinPostsWithPeople(posts, people);


If, after your testing day, you decide you want:

await getPosts({ with: ['tags', 'people'] })


we can add it, but it’s an extra layer (and you wanted to keep this lean).
