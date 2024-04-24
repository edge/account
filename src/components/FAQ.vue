<script setup>
import { onMounted, ref } from 'vue'

// Via https://heroicons.com/
const chevronDown = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
</svg>`

// Via https://heroicons.com/
const chevronUp = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
</svg>`

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
 *         <h5>Question?</h5>
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
      const icon = article.querySelector('icon')
      articles.push({ article, header, content, icon })
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
  for (const { header, content, icon } of getArticles()) {
    let _icon = icon
    if (!_icon) {
      _icon = document.createElement('div')
      _icon.innerHTML = chevronDown
      header.appendChild(_icon)
    }

    header.addEventListener('click', () => {
      if (content.style.display === 'none') {
        content.style.display = ''
        _icon.innerHTML = chevronUp
      }
      else {
        content.style.display = 'none'
        _icon.innerHTML = chevronDown
      }
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
  @apply flex flex-row;
  cursor: pointer;
}

.faq h1, .faq h2, .faq h3, .faq h4, .faq h5, .faq h6 {
  @apply m-0;
}

.faq section {
  @apply mt-4;
}
</style>
