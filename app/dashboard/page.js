// app/dashboard/page.js
"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, BookOpen, LogOut, User, Edit, Trash2, Save, X } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStory, setEditingStory] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchStories()
    }
  }, [status, router])

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories")
      if (response.ok) {
        const data = await response.json()
        setStories(data)
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStoryClick = (story) => {
    setSelectedStory(story)
    setShowForm(false)
    setEditingStory(null)
  }

  const handleAddNew = () => {
    setFormData({ title: "", description: "", content: "" })
    setShowForm(true)
    setSelectedStory(null)
    setEditingStory(null)
  }

  const handleEdit = (story) => {
    setFormData({
      title: story.title,
      description: story.description,
      content: story.content
    })
    setEditingStory(story)
    setShowForm(true)
    setSelectedStory(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingStory ? `/api/stories/${editingStory.id}` : "/api/stories"
      const method = editingStory ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchStories()
        setShowForm(false)
        setEditingStory(null)
        setFormData({ title: "", description: "", content: "" })
      }
    } catch (error) {
      console.error("Error saving story:", error)
    }
  }

  const handleDelete = async (storyId) => {
    if (!confirm("Are you sure you want to delete this story?")) return
    
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchStories()
        if (selectedStory?.id === storyId) {
          setSelectedStory(null)
        }
      }
    } catch (error) {
      console.error("Error deleting story:", error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingStory(null)
    setFormData({ title: "", description: "", content: "" })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{session.user.name}</h3>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={handleAddNew}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 text-blue-600 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Story</span>
            </button>
            
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                My Stories ({stories.length})
              </h4>
              <div className="space-y-1">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group ${
                      selectedStory?.id === story.id ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div
                      onClick={() => handleStoryClick(story)}
                      className="flex items-center space-x-2 flex-1 min-w-0"
                    >
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{story.title}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-1 hover:bg-blue-200 rounded"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="p-1 hover:bg-red-200 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Selected Story Content */}
        {selectedStory && (
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedStory.title}
              </h1>
              <p className="text-gray-600 mb-4">{selectedStory.description}</p>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {selectedStory.content}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {!selectedStory && !showForm && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  Welcome to Interview Stories
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a story from the sidebar or create a new one to get started.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {story.description}
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    {new Date(story.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {/* Add new story card */}
              <div
                onClick={handleAddNew}
                className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center"
              >
                <Plus className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-600 font-medium">Add New Story</span>
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingStory ? "Edit Story" : "Create New Story"}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter story title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Content
                    </label>
                    <textarea
                      required
                      rows={12}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your full interview story here..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingStory ? "Update" : "Create"} Story</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}