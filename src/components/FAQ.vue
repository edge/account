<script setup>
import { onMounted, ref } from 'vue'

/**
 * The FAQ component can be used to display a series of questions with collapsible answers, like an accordion.
 * This is implemented solely in the DOM to simplify usage within components.
 *
 * The expected content structure is `FAQ > article > {header, section}` which in practice looks something like this:
 *
 * ```html
 * <FAQ>
 *   <div>
 *     <article>
 *       <header>
 *         <h4>Question?</h4>
 *       </header>
 *       <section>
 *         <p>Answer</p>
 *       </section>
 *     </article>
 *   </div>
 * </FAQ>
 * ```
 *
 * (An outer `div` is required because the FAQ template only provides a single slot.
 * This also provides styling.)
 *
 * All `section` elements are collapsed (hidden with CSS `display: none`) when the FAQ is mounted.
 * When the accompanying `header` is clicked, the `section` toggles between expanded and collapsed.
 */
const faq = ref(null)

function getArticles() {
  const articles = []

  if (faq) {
    faq.value.querySelectorAll('article').forEach(article => {
      const header = article.querySelector('header')
      const content = article.querySelector('section')
      articles.push({ article, header, content })
    })
  }

  return articles
}

function collapseAll() {
  for (const { content } of getArticles()) {
    content.style.display = 'none'
  }
}

onMounted(() => {
  for (const { header, content } of getArticles()) {
    header.addEventListener('click', () => {
      if (content.style.display === 'none') content.style.display = ''
      else content.style.display = 'none'
    })
  }

  collapseAll()
})
</script>

<template>
  <div class="faq" ref="faq">
    <slot></slot>
  </div>
</template>

<style>
.faq > div {
  @apply flex flex-col gap-4;
}

.faq header {
  cursor: pointer;
}

.faq h1, .faq h2, .faq h3, .faq h4, .faq h5, .faq h6 {
  @apply m-0;
}

.faq section {
  @apply mt-4;
}
</style>
