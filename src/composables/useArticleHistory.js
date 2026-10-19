// import { ref, watch, onMounted } from 'vue'

// const STORAGE_KEY = 'littleKorean_article_history'
// const SAVE_DELAY = 3 * 60 * 1000 // 3 minutes in milliseconds

// export function useArticleHistory() {
//   const articles = ref([])
//   const saveTimeout = ref(null)
//   const currentArticleId = ref(null)
//   const lastContentHash = ref('')
  
//   // Load articles from localStorage
//   const loadArticles = () => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY)
//       if (saved) {
//         const parsed = JSON.parse(saved)
//         if (Array.isArray(parsed)) {
//           articles.value = parsed.map(article => ({
//             ...article,
//             id: article.id || Date.now(),
//             title: article.title || 'Untitled Article',
//             koreanContent: article.koreanContent || article.chineseContent || '',
//             englishContent: article.englishContent || '',
//             timestamp: article.timestamp || Date.now(),
//             version: article.version || 2,
//             // Track when article was last edited
//             lastEdited: article.lastEdited || article.timestamp || Date.now()
//           }))
//         }
//       }
//     } catch (error) {
//       console.error('Failed to load articles:', error)
//       articles.value = []
//     }
//   }
  
//   // Save articles to localStorage
//   const saveArticles = () => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(articles.value))
//     } catch (error) {
//       console.error('Failed to save articles:', error)
//     }
//   }
  
//   // Generate a simple hash of the content to detect changes
//   const generateContentHash = (korean, english) => {
//     return `${korean}|${english}`.length.toString() + 
//            (korean + english).substring(0, 100)
//   }
  
//   // Extract title from first line of English content (preferred) or Korean
//   const extractTitle = (koreanContent, englishContent) => {
//     // First try English content
//     if (englishContent && englishContent.trim()) {
//       const firstLine = englishContent.split('\n')[0].trim()
//       if (firstLine && firstLine.length > 0) {
//         return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine
//       }
//     }
    
//     // Fallback to Korean content
//     if (koreanContent && koreanContent.trim()) {
//       const firstLine = koreanContent.split('\n')[0].trim()
//       if (firstLine && firstLine.length > 0) {
//         return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine
//       }
//     }
    
//     return 'Untitled Article'
//   }
  
//   // Save current article to history
//   const saveCurrentArticle = (koreanContent, englishContent) => {
//     if (!koreanContent || !koreanContent.trim()) {
//       return
//     }
    
//     const contentHash = generateContentHash(koreanContent, englishContent)
//     const title = extractTitle(koreanContent, englishContent)
//     const now = Date.now()
    
//     // Check if we should update an existing article
//     if (contentHash === lastContentHash.value && currentArticleId.value) {
//       const existingArticle = articles.value.find(a => a.id === currentArticleId.value)
//       if (existingArticle && 
//           existingArticle.koreanContent === koreanContent && 
//           existingArticle.englishContent === englishContent) {
//         existingArticle.timestamp = now
//         existingArticle.lastEdited = now
//         existingArticle.title = title
//         saveArticles()
//         return
//       }
//     }
    
//     // Check if we already have an article with this exact content
//     const existingArticle = articles.value.find(a => 
//       a.koreanContent === koreanContent && 
//       a.englishContent === (englishContent || '')
//     )
    
//     if (existingArticle) {
//       existingArticle.timestamp = now
//       existingArticle.lastEdited = now
//       existingArticle.title = title
//       currentArticleId.value = existingArticle.id
//       lastContentHash.value = contentHash
//       saveArticles()
//       return
//     }
    
//     // Create new article
//     const newArticle = {
//       id: Date.now(),
//       title: title,
//       koreanContent: koreanContent,
//       englishContent: englishContent || '',
//       timestamp: now,
//       lastEdited: now,
//       version: 2
//     }
    
//     articles.value.unshift(newArticle)
    
//     // Keep only last 50 articles
//     if (articles.value.length > 50) {
//       articles.value = articles.value.slice(0, 50)
//     }
    
//     currentArticleId.value = newArticle.id
//     lastContentHash.value = contentHash
//     saveArticles()
//   }
  
//   // Schedule auto-save after delay
//   const scheduleAutoSave = (koreanContent, englishContent) => {
//     if (saveTimeout.value) {
//       clearTimeout(saveTimeout.value)
//     }
    
//     if (koreanContent && koreanContent.trim()) {
//       saveTimeout.value = setTimeout(() => {
//         saveCurrentArticle(koreanContent, englishContent)
//         saveTimeout.value = null
//       }, SAVE_DELAY)
//     }
//   }
  
//   // Cancel pending auto-save
//   const cancelAutoSave = () => {
//     if (saveTimeout.value) {
//       clearTimeout(saveTimeout.value)
//       saveTimeout.value = null
//     }
//   }
  
//   // Delete an article
//   const deleteArticle = (articleId) => {
//     const index = articles.value.findIndex(a => a.id === articleId)
//     if (index !== -1) {
//       articles.value.splice(index, 1)
//       saveArticles()
//       return true
//     }
//     return false
//   }
  
//   // Delete all articles
//   const deleteAllArticles = () => {
//     articles.value = []
//     saveArticles()
//   }
  
//   // Load an article into the editor
//   const loadArticle = (article) => {
//     return {
//       korean: article.koreanContent || article.chineseContent || '',
//       english: article.englishContent || ''
//     }
//   }
  
//   // Check if article is currently being viewed
//   const isCurrentArticle = (articleId) => {
//     return currentArticleId.value === articleId
//   }
  
//   // Get formatted date string with edit info
//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp)
//     const now = new Date()
//     const diffMs = now - date
//     const diffMins = Math.floor(diffMs / 60000)
//     const diffHours = Math.floor(diffMs / 3600000)
//     const diffDays = Math.floor(diffMs / 86400000)
    
//     if (diffMins < 1) return 'Just now'
//     if (diffMins < 60) return `${diffMins}m ago`
//     if (diffHours < 24) return `${diffHours}h ago`
//     if (diffDays < 7) return `${diffDays}d ago`
    
//     return date.toLocaleDateString()
//   }
  
//   // Reset current article tracking
//   const resetCurrentTracking = () => {
//     currentArticleId.value = null
//     lastContentHash.value = ''
//     cancelAutoSave()
//   }
  
//   onMounted(() => {
//     loadArticles()
//   })
  
//   return {
//     articles,
//     scheduleAutoSave,
//     cancelAutoSave,
//     saveCurrentArticle,
//     deleteArticle,
//     deleteAllArticles,
//     loadArticle,
//     isCurrentArticle,
//     formatDate,
//     resetCurrentTracking
//   }
// }


// composables/useArticleHistory.js
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'littleKorean_articles'
const MAX_ARTICLES = 100

export function useArticleHistory() {
  const articles = ref([])
  const currentArticleId = ref(null)
  const autoSaveTimeout = ref(null)
  const isSaving = ref(false)

  // Load articles from localStorage
  const loadArticles = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        articles.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load articles:', error)
      articles.value = []
    }
  }

  // Save articles to localStorage
  const saveArticles = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles.value))
    } catch (error) {
      console.error('Failed to save articles:', error)
    }
  }

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  // Extract title from content (first 50 chars or first line)
  const extractTitle = (content) => {
    if (!content) return 'Untitled'
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0) return 'Untitled'
    const firstLine = lines[0].trim()
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
  }

  // Save current article manually
  const saveCurrentArticle = (koreanContent, englishContent) => {
    if (!koreanContent || !koreanContent.trim()) {
      console.warn('No Korean content to save')
      return null
    }

    // Check if this content is already saved (avoid duplicates)
    const existingIndex = articles.value.findIndex(a => 
      a.koreanContent === koreanContent && 
      a.englishContent === englishContent
    )

    if (existingIndex !== -1) {
      // Update existing article timestamp
      articles.value[existingIndex].timestamp = Date.now()
      saveArticles()
      currentArticleId.value = articles.value[existingIndex].id
      return articles.value[existingIndex]
    }

    // Create new article
    const article = {
      id: generateId(),
      koreanContent: koreanContent,
      englishContent: englishContent || '',
      title: extractTitle(koreanContent),
      timestamp: Date.now()
    }

    // Add to beginning of array
    articles.value.unshift(article)

    // Limit number of articles
    if (articles.value.length > MAX_ARTICLES) {
      articles.value = articles.value.slice(0, MAX_ARTICLES)
    }

    saveArticles()
    currentArticleId.value = article.id
    return article
  }

  // Schedule auto-save (with debounce)
  const scheduleAutoSave = (koreanContent, englishContent) => {
    // Clear any existing timeout
    if (autoSaveTimeout.value) {
      clearTimeout(autoSaveTimeout.value)
    }

    // Only schedule if there's content
    if (!koreanContent || !koreanContent.trim()) {
      return
    }

    // Set new timeout (3 seconds delay)
    autoSaveTimeout.value = setTimeout(() => {
      saveCurrentArticle(koreanContent, englishContent)
      autoSaveTimeout.value = null
    }, 3000)
  }

  // Cancel auto-save
  const cancelAutoSave = () => {
    if (autoSaveTimeout.value) {
      clearTimeout(autoSaveTimeout.value)
      autoSaveTimeout.value = null
    }
  }

  // Delete an article
  const deleteArticle = (articleId) => {
    articles.value = articles.value.filter(a => a.id !== articleId)
    if (currentArticleId.value === articleId) {
      currentArticleId.value = null
    }
    saveArticles()
  }

  // Delete all articles
  const deleteAllArticles = () => {
    articles.value = []
    currentArticleId.value = null
    saveArticles()
  }

  // Load an article into the editor
  const loadArticle = (articleId) => {
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      currentArticleId.value = articleId
      return article
    }
    return null
  }

  // Check if an article is the current one
  const isCurrentArticle = (articleId) => {
    return currentArticleId.value === articleId
  }

  // Reset current tracking
  const resetCurrentTracking = () => {
    currentArticleId.value = null
  }

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now'
    }
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}m ago`
    }
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}h ago`
    }
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days}d ago`
    }
    // Format as date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Initialize
  onMounted(() => {
    loadArticles()
  })

  return {
    articles,
    currentArticleId,
    isSaving,
    saveCurrentArticle,
    scheduleAutoSave,
    cancelAutoSave,
    deleteArticle,
    deleteAllArticles,
    loadArticle,
    isCurrentArticle,
    resetCurrentTracking,
    formatDate,
    saveArticles // Expose for manual saves
  }
}