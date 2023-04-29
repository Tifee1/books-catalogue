import React, { useContext, useState, useEffect } from 'react'
import { searchAuthors, searchGenres } from '../../utils/utils'

const BooksContext = React.createContext(null)

export const BooksProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [filteredBooks, FilteredBooks] = useState([])
  const [singleLoading, setSingleLoading] = useState(true)
  const [singleBook, setSingleBook] = useState({})
  const [page, setPage] = useState(0)
  const [pagedBooks, setPagedBooks] = useState([])
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('all')

  const fetchBooks = async () => {
    const res = await fetch('/data/books.json')
    const data = await res.json()
    return data.map((item, i) => {
      const id = item.title.slice(0, 15).replace(/ /g, '-').toLowerCase() + i
      return { id, ...item }
    })
  }

  const storeBooks = async () => {
    setLoading(true)
    const data = await fetchBooks()
    setBooks(data)
    setPagedBooks(paginate(data))
    setLoading(false)
  }

  const fetchSingleBook = async (id) => {
    setSingleLoading(true)
    setSingleBook(null)
    const data = await fetchBooks()
    const single = await data.find((item) => item.id === id)
    setSingleBook(single)
    setSingleLoading(false)
  }

  const paginate = (data) => {
    const perPage = 10
    const allPages = Math.ceil(data.length / perPage)
    const newUsers = Array.from({ length: allPages }, (_, index) => {
      const start = index * perPage
      return data.slice(start, start + perPage)
    })
    return newUsers
  }

  const searchBooks = (search) => {
    setLoading(true)
    setGenre('all')
    const newBooks = books.filter((book) => {
      return (
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        searchAuthors(book.authors, search)
      )
    })
    setPagedBooks(paginate(newBooks))
    setPage(0)
    setLoading(false)
  }

  const searchGenre = (genre) => {
    setLoading(true)
    let newBooks
    if (genre.toLowerCase() === 'all') {
      newBooks = books
    } else {
      newBooks = books.filter((book) => {
        return searchGenres(book.genre, genre)
      })
    }

    setPagedBooks(paginate(newBooks))
    setPage(0)
    setSearch('')
    setLoading(false)
  }

  useEffect(() => {
    storeBooks()
  }, [])

  return (
    <BooksContext.Provider
      value={{
        loading,
        books,
        filteredBooks,
        singleBook,
        singleLoading,
        fetchSingleBook,
        pagedBooks,
        page,
        setPage,
        searchBooks,
        searchGenre,
        search,
        genre,
        setSearch,
        setGenre,
      }}
    >
      {children}
    </BooksContext.Provider>
  )
}

const useBookContext = () => {
  return useContext(BooksContext)
}

export default useBookContext
