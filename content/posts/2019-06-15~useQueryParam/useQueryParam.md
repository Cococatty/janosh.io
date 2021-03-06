---
title: useQueryParam
subtitle: React hook for URL query parameters
slug: /use-query-param
date: 2019-06-15
cover:
  img: useQueryParam.svg
  thumbnail: thumbnail.svg
tags:
  - JS
  - Tutorial
  - Web Dev
---

Here's a straightforward implementation of a React hook that allows you to set, modify and remove URL query parameters. There is already a popular and high quality implementation by [Peter Beshai on GitHub](https://github.com/pbeshai/use-query-params). I was going to use that at first but about two thirds of the way through reading its source code I decided that it's a little overengineered for my simple use case. Peter's `use-query-params` offers React Router and Reach Router integrations, uses `React.createContext` internally to pass their history objects down to subscribing components, has dependencies on external packages and requires you to import and then specify types (numbers, strings, arrays, etc.) for any query parameter you specify. All I really want to do is append the odd string to a URL and I'm happy to simply rely on browser APIs to do it for me. (Should I need other types in the future, I guess I'll just try my luck with `JSON.stringify` and `JSON.parse`.)

So I decided to start from scratch and just roll my own. Considering that it ended up taking less than 30 lines of code, I think it was the right decision in my case.

```js:title=src/hooks/useQueryParam.js
import { useState } from 'react'

const handleParam = (key, value, options = {}) => {
  const { historyState = `replace`, nullDeletes = true } = options
  // Parse current query string using the browser's URLSearchParams API.
  const params = new URLSearchParams(location.search)

  // If the passed value is undefined, check if the URL already contains
  // a value for it. This is important on initial page load.
  if (value === undefined) value = params.get(key)
  // If the passed value is null and the nullDeletes option is
  // set to true, delete the corresponding query parameter.
  if (value === null && nullDeletes) params.delete(key)
  // Else use the provided value and key to set the query parameter.
  else params.set(key, value)

  // Construct URL containing the updated query parameter(s).
  const target =
    location.pathname.replace(/\/$/, ``) +
    (params.toString() ? `?` + params.toString() : ``)

  // Update the browser URL. Supports the option `historyState = (replace|push)`
  // to either add to the browser history or replace the last item.
  history[historyState + `State`]({ path: value }, ``, target)
  return value
}

export const useQueryParam = (key, value, options) => {
  // Relies on useState to trigger component rerenders on calls to setParam.
  const [param, setParam] = useState(handleParam(key, value, options))
  return [
    param,
    // `override` allows changing the hook-level `options` for
    // individual `setQueryParam` calls.
    (newValue, override) =>
      setParam(handleParam(key, newValue, { ...options, ...override })),
  ]
}
```

`key` and `value` will appear as `?(...&)key=value` in the URL query. The `options` object can contain a boolean `nullDeletes` which specifies on a per-hook basis whether passing `null` as the value should delete the parameter from the URL query, as well as a string `historyState` that determines whether changes to the query should replace or be appended to the browser history. With the default `historyState = 'replace'`, the user will get back to the previous page immediately when using the browser's back button. `historyState = 'push'`, will require one back button press for every time `setQueryParam` is called on that page.

## Usage Example

Here's an example of how to use this hook to filter a list of posts on a blog page by tag. The `TagList` component in the last highlighted line simply uses `setActiveTag` in a `onClick` callback function `onClick={() => setActiveTag(tag.slug)}`. Note that the `All` tag has a `slug` of `null` so that clicking it will remove the query parameter.

```js:title=src/pages/blog.js
import React from 'react'
import { kebabCase } from 'lodash'

import Global from 'components/Global'
import PageTitle from 'components/PageTitle'
import { PageBody } from 'components/styles'
import TagList from 'components/TagList'
import PostList from 'views/PostList'
import { useQueryParam } from 'hooks' // highlight-line

const addSlugs = tags =>
  tags.map(tag => ({
    slug: kebabCase(tag.title),
    ...tag,
  }))

const insertAllTag = (tags, count) =>
  !tags.map(tag => tag.title).includes(`All`)
    ? [{ title: `All`, slug: null, count }, ...addSlugs(tags)] // highlight-line
    : tags

const filterPostsByTag = (tag, posts) =>
  tag && tag.slug
    ? posts.filter(({ node }) => node.frontmatter.tags.includes(tag.title))
    : posts

export default function BlogPage({ data, location }) {
  const { posts, tags, img } = data
  const [activeTag, setActiveTag] = useQueryParam(`tag`) // highlight-line
  const allTags = insertAllTag(tags.group, posts.edges.length)
  const filteredPosts = filterPostsByTag(
    allTags.find(tag => tag.slug === activeTag),
    posts.edges
  )
  return (
    <Global pageTitle="Blog" path={location.pathname}>
      <PageTitle img={img && img.sharp}>
        <h1>Blog</h1>
      </PageTitle>
      <PageBody>
        <TagList {...{ tags: allTags, activeTag, setActiveTag }} /> // highlight-line
        <PostList inBlog posts={filteredPosts} />
      </PageBody>
    </Global>
  )
}
```
