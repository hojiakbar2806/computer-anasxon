let issueTypesChartInstance = null
let locationsChartInstance = null

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Dashboard loaded")

  
  if (!window.auth.isAuthenticated()) {
    console.log("User not authenticated, redirecting to login")
    window.location.href = "index.html"
    return
  }

  
  const user = await window.auth.loadCurrentUser()

  if (!user) {
    console.log("Failed to load user, redirecting to login")
    window.auth.logout()
    return
  }

  console.log("User loaded:", user)

  
  updateUIForRole(user.role)

  
  const userGreeting = document.getElementById("userGreeting")
  if (userGreeting) {
    userGreeting.textContent = `Salom, ${user.first_name || user.email}!`
  }

  
  await loadDashboardData(user.role)
})

function updateUIForRole(role) {
  console.log("Updating UI for role:", role)

  
  document.getElementById("userNav").classList.add("hidden")
  document.getElementById("managerNav").classList.add("hidden")
  document.getElementById("masterNav").classList.add("hidden")

  
  document.getElementById("userDashboard").classList.add("hidden")
  document.getElementById("managerDashboard").classList.add("hidden")
  document.getElementById("masterDashboard").classList.add("hidden")

  if (role === "user") {
    setupUserNavigation()
    document.getElementById("userNav").classList.remove("hidden")
    document.getElementById("userDashboard").classList.remove("hidden")
  } else if (role === "manager") {
    setupManagerNavigation()
    document.getElementById("managerNav").classList.remove("hidden")
    document.getElementById("managerDashboard").classList.remove("hidden")
  } else if (role === "master") {
    setupMasterNavigation()
    document.getElementById("masterNav").classList.remove("hidden")
    document.getElementById("masterDashboard").classList.remove("hidden")
  }
}

function setupUserNavigation() {
  const userNav = document.getElementById("userNav")
  userNav.innerHTML = `
        <a href="#" onclick="showSection('userDashboard')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-home mr-3 text-blue-600"></i>
            <span class="font-medium">Bosh sahifa</span>
        </a>
        <a href="#" onclick="showSection('profileSection')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-user mr-3 text-green-600"></i>
            <span class="font-medium">Profil</span>
        </a>
    `
}

function setupManagerNavigation() {
  const managerNav = document.getElementById("managerNav")
  managerNav.innerHTML = `
        <a href="#" onclick="showManagerSection('requests')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-list mr-3 text-blue-600"></i>
            <span class="font-medium">So'rovlar</span>
        </a>
        <a href="#" onclick="showManagerSection('users')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-users mr-3 text-green-600"></i>
            <span class="font-medium">Foydalanuvchilar</span>
        </a>
        <a href="#" onclick="showManagerSection('components')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-cogs mr-3 text-purple-600"></i>
            <span class="font-medium">Komponentlar</span>
        </a>
        <a href="#" onclick="showSection('statisticsSection')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-chart-bar mr-3 text-orange-600"></i>
            <span class="font-medium">Statistika</span>
        </a>
        <a href="#" onclick="showSection('profileSection')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-user mr-3 text-indigo-600"></i>
            <span class="font-medium">Profil</span>
        </a>
    `
}

function setupMasterNavigation() {
  const masterNav = document.getElementById("masterNav")
  masterNav.innerHTML = `
        <a href="#" onclick="showMasterSection('assigned')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-tasks mr-3 text-blue-600"></i>
            <span class="font-medium">Tayinlangan ishlar</span>
        </a>
        <a href="#" onclick="showMasterSection('components')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-cogs mr-3 text-purple-600"></i>
            <span class="font-medium">Komponentlar</span>
        </a>
        <a href="#" onclick="showSection('profileSection')" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <i class="fas fa-user mr-3 text-green-600"></i>
            <span class="font-medium">Profil</span>
        </a>
    `
}

async function loadDashboardData(role) {
  console.log("Loading dashboard data for role:", role)

  if (role === "user") {
    await loadUserRequests()
  } else if (role === "manager") {
    await loadManagerRequests()
  } else if (role === "master") {
    await loadMasterRequests()
  }
}

async function loadUserRequests() {
  try {
    const response = await window.api.getSupportRequests()
    if (response.ok) {
      const requests = await response.json()
      displayUserRequests(requests)
    } else {
      console.error("Failed to load user requests")
      window.ui.showToast("So'rovlarni yuklashda xatolik", "error")
    }
  } catch (error) {
    console.error("Error loading user requests:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

function displayUserRequests(requests) {
  const container = document.getElementById("userRequests")
  if (!container) return

  if (requests.length === 0) {
    container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-lg shadow">
                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Hozircha so'rovlaringiz yo'q</h3>
                <p class="text-gray-500">Yangi so'rov yaratish uchun yuqoridagi tugmani bosing</p>
            </div>
        `
    return
  }

  container.innerHTML = requests
    .map(
      (request) => `
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">${request.device_model}</h3>
                    <p class="text-gray-600 text-sm">${request.problem_area}</p>
                </div>
                <div class="flex-shrink-0">
                    ${window.ui.getStatusBadge(request.status)}
                </div>
            </div>
            <div class="mb-4">
                <div class="flex items-center mb-2">
                    <i class="${window.ui.getIssueTypeIcon(request.issue_type)} mr-2 text-gray-500"></i>
                    <span class="text-sm text-gray-600 capitalize">${request.issue_type}</span>
                </div>
                <p class="text-sm text-gray-700 line-clamp-3">${request.description}</p>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0">
                <span class="flex items-center">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    ${request.location}
                </span>
                <span class="flex items-center">
                    <i class="fas fa-calendar mr-1"></i>
                    ${new Date(request.created_at || Date.now()).toLocaleDateString()}
                </span>
            </div>
            ${
              request.status === "approved"?
              `<div class="flex justify-end mt-4">
                <button onclick="acceptRequest('${request._id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Tasdiqlash
                </button>
            </div>`
              :""
            }
        </div>
    `,
    )
    .join("")
}


function showSection(sectionId) {
  
  const sections = ["userDashboard", "managerDashboard", "masterDashboard", "profileSection", "statisticsSection"]
  sections.forEach((id) => {
    const section = document.getElementById(id)
    if (section) section.classList.add("hidden")
  })

  
  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.classList.remove("hidden")

    
    if (sectionId === "profileSection") {
      loadProfileData()
    } else if (sectionId === "statisticsSection") {
      loadStatistics()
    }
  }

  
  closeMobileSidebar()
}

function showManagerSection(section) {
  
  showSection("managerDashboard")

  const managerContent = document.getElementById("managerContent")
  if (!managerContent) return

  switch (section) {
    case "requests":
      loadManagerRequests()
      break
    case "users":
      loadManagerUsers()
      break
    case "components":
      loadManagerComponents()
      break
  }
}

function showMasterSection(section) {
  
  showSection("masterDashboard")

  const masterContent = document.getElementById("masterContent")
  if (!masterContent) return

  switch (section) {
    case "assigned":
      loadMasterRequests()
      break
    case "components":
      loadMasterComponents()
      break
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar")
  const overlay = document.getElementById("sidebarOverlay")
  if (sidebar && overlay) {
    sidebar.classList.add("-translate-x-full")
    overlay.classList.add("hidden")
  }
}

async function loadManagerRequests() {
  try {
    const response = await window.api.getSupportRequests()
    if (response.ok) {
      const requests = await response.json()
      displayManagerRequests(requests)
    } else {
      window.ui.showToast("So'rovlarni yuklashda xatolik", "error")
    }
  } catch (error) {
    console.error("Error loading manager requests:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

function displayManagerRequests(requests) {
  const managerContent = document.getElementById("managerContent")
  if (!managerContent) return

  managerContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-bold mb-4">So'rovlar boshqaruvi</h2>
            <div class="grid gap-4 sm:gap-6">
                ${requests
                  .map(
                    (request) => `
                    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900">${request.device_model}</h3>
                                <p class="text-gray-600 text-sm">${request.user_name || "N/A"}</p>
                            </div>
                            <div class="flex-shrink-0">
                                ${window.ui.getStatusBadge(request.status)}
                            </div>
                        </div>
                        <div class="mb-4">
                            <p class="text-sm text-gray-700">${request.description}</p>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                            <span class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-map-marker-alt mr-1"></i>
                                ${request.location}
                            </span>
                            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                             
                                ${
                                  request.status === "pending"
                                    ? `
                                    <button onclick="sendToMaster('${request._id}')" class="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                                        <i class="fas fa-user-cog mr-1"></i>
                                        Masterga yuborish
                                    </button>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `
}


async function updateRequestStatus(requestId, status) {
  try {
    const response = await window.api.updateSupportStatus(requestId, status)
    if (response.ok) {
      window.ui.showToast("Status yangilandi")
      await loadManagerRequests()
    } else {
      window.ui.showToast("Xatolik yuz berdi", "error")
    }
  } catch (error) {
    console.error("Error updating status:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

async function sendToMaster(requestId) {
  try {
    const response = await window.api.sendSupportMaster(requestId)
    if (response.ok) {
      window.ui.showToast("Masterga yuborildi")
      await loadManagerRequests()
    } else {
      window.ui.showToast("Xatolik yuz berdi", "error")
    }
  } catch (error) {
    console.error("Error sending to master:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

async function loadManagerUsers() {
  try {
    const response = await window.api.getUsers()
    if (response.ok) {
      const users = await response.json()
      displayManagerUsers(users)
    } else {
      window.ui.showToast("Foydalanuvchilarni yuklashda xatolik", "error")
    }
  } catch (error) {
    console.error("Error loading users:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

function displayManagerUsers(users) {
  const managerContent = document.getElementById("managerContent")
  if (!managerContent) return

  managerContent.innerHTML = `
        <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h2 class="text-xl font-bold">Foydalanuvchilar</h2>
                <button onclick="openCreateUserModal()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Yangi foydalanuvchi
                </button>
            </div>
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ism</th>
                                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Telefon</th>
                                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${users
                              .map(
                                (user) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">${user.first_name} ${user.last_name}</div>
                                        <div class="text-sm text-gray-500 sm:hidden">${user.email}</div>
                                    </td>
                                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div class="text-sm text-gray-900">${user.email}</div>
                                    </td>
                                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <div class="text-sm text-gray-900">${user.phone}</div>
                                    </td>
                                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">${user.role}</span>
                                    </td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}

async function loadManagerComponents() {
  try {
    const response = await window.api.getComponents()
    if (response.ok) {
      const components = await response.json()
      displayManagerComponents(components)
    } else {
      window.ui.showToast("Komponentlarni yuklashda xatolik", "error")
    }
  } catch (error) {
    console.error("Error loading components:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

function displayManagerComponents(components) {
  const managerContent = document.getElementById("managerContent")
  if (!managerContent) return

  managerContent.innerHTML = `
        <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h2 class="text-xl font-bold">Komponentlar</h2>
                <button onclick="openCreateComponentModal()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Yangi komponent
                </button>
            </div>
            <div class="grid gap-4 sm:gap-6">
                ${components
                  .map(
                    (component) => `
                    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900">${component.title}</h3>
                                <p class="text-gray-600 text-sm">${component.description}</p>
                            </div>
                            <div class="text-right flex-shrink-0">
                                <p class="text-lg font-bold text-green-600">$${component.price}</p>
                                <p class="text-sm text-gray-500">Omborda: ${component.in_stock}</p>
                            </div>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <button onclick="editComponent('${component._id}')" class="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                                <i class="fas fa-edit mr-1"></i>
                                Tahrirlash
                            </button>
                            <button onclick="deleteComponent('${component._id}')" class="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors">
                                <i class="fas fa-trash mr-1"></i>
                                O'chirish
                            </button>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `
}

async function loadMasterRequests() {
  try {
    const response = await window.api.getSupportRequests()
    if (response.ok) {
      const requests = await response.json()
      
      displayMasterRequests(requests)
    } else {
      window.ui.showToast("So'rovlarni yuklashda xatolik", "error")
    }
  } catch (error) {
    console.error("Error loading master requests:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

function displayMasterRequests(requests) {
  const masterContent = document.getElementById("masterContent")
  if (!masterContent) return

  const statusFilter = `
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 class="text-xl font-bold">Barcha so'rovlar</h2>
        <div class="flex space-x-2">
          <select id="masterStatusFilter" onchange="filterMasterRequests()" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Barcha statuslar</option>
            <option value="pending">Kutilmoqda</option>
            <option value="checked">Tekshirildi</option>
            <option value="approved">Tasdiqlandi</option>
            <option value="in_progress">Jarayonda</option>
            <option value="completed">Tugallandi</option>
          </select>
        </div>
      </div>
      <div id="masterRequestsList" class="grid gap-4 sm:gap-6">
        ${requests
          .map(
            (request) => `
            <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow" 
                 data-status="${request.status}"
                 data-request-id="${request._id}"
                 data-component-id="${request.component_id || ""}"
                 data-quantity="${request.quantity || 1}"
                 data-price="${request.price || ""}"
                 data-end-date="${request.end_date || ""}">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900">${request.device_model}</h3>
                        <p class="text-gray-600 text-sm">${request.problem_area}</p>
                        <p class="text-gray-500 text-xs">Mijoz: ${request.user_name || "N/A"}</p>
                    </div>
                    <div class="flex-shrink-0">
                        ${window.ui.getStatusBadge(request.status)}
                    </div>
                </div>
                <div class="mb-4">
                    <p class="text-sm text-gray-700">${request.description}</p>
                    ${request.price ? `<p class="text-sm text-green-600 font-medium mt-2">Narx: $${request.price}</p>` : ""}
                    ${request.end_date ? `<p class="text-sm text-blue-600 font-medium">Tugash: ${new Date(request.end_date).toLocaleDateString()}</p>` : ""}
                </div>
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <span class="text-sm text-gray-500 flex items-center">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        ${request.location}
                    </span>
                    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        ${
                          request.status === "checked"
                            ? `
                            <button onclick="openMasterEditModal('${request._id}')" class="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                                <i class="fas fa-edit mr-1"></i>
                                Tahrirlash
                            </button>
                        `
                            : ""
                        }
                        ${
                          request.status === "in_progress"
                            ? `
                            <button onclick="completeRequest('${request._id}')" class="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                                <i class="fas fa-check mr-1"></i>
                                Tugallash
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `

  masterContent.innerHTML = statusFilter
}


window.filterMasterRequests = () => {
  const filter = document.getElementById("masterStatusFilter").value
  const requests = document.querySelectorAll("#masterRequestsList > div")

  requests.forEach((request) => {
    const status = request.getAttribute("data-status")
    if (filter === "" || status === filter) {
      request.style.display = "block"
    } else {
      request.style.display = "none"
    }
  })
}

async function loadMasterComponents() {
  try {
    const response = await window.api.getComponents()
    if (response.ok) {
      const components = await response.json()
      displayMasterComponents(components)
    } else {
      window.ui.showToast("Komponentlarni yuklashda xatolik", "error")
    }
  } catch (error) {
    console.error("Error loading components:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

function displayMasterComponents(components) {
  const masterContent = document.getElementById("masterContent")
  if (!masterContent) return

  masterContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-bold mb-4">Komponentlar</h2>
            <div class="grid gap-4 sm:gap-6">
                ${components
                  .map(
                    (component) => `
                    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900">${component.title}</h3>
                                <p class="text-gray-600 text-sm">${component.description}</p>
                            </div>
                            <div class="text-right flex-shrink-0 mt-2 sm:mt-0">
                                <p class="text-lg font-bold text-green-600">$${component.price}</p>
                                <p class="text-sm text-gray-500">Omborda: ${component.in_stock}</p>
                            </div>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `
}

async function loadProfileData() {
  try {
    
    if (!window.auth.currentUser) {
      console.log("Current user not found, trying to reload...")
      await window.auth.loadCurrentUser()
    }

    if (window.auth.currentUser) {
      const profileForm = document.getElementById("profileForm")
      if (profileForm) {
        console.log("Loading profile data:", window.auth.currentUser)
        window.ui.populateForm(profileForm, window.auth.currentUser, 'password')
      }
    } else {
      console.error("No current user found")
      window.ui.showToast("Foydalanuvchi ma'lumotlari yuklanmadi", "error")
    }
  } catch (error) {
    console.error("Error loading profile data:", error)
    window.ui.showToast("Profil ma'lumotlarini yuklashda xatolik", "error")
  }
}

async function loadStatistics() {
  try {
    const response = await window.api.getSupportRequests()
    if (response.ok) {
      const requests = await response.json()
      displayStatistics(requests)
    } else {
      window.ui.showToast("Statistikani yuklashda xatolik", "error")
    }
  } catch (error) {
    console.error("Error loading statistics:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

function displayStatistics(requests) {
  
  document.getElementById("totalRequests").textContent = requests.length
  document.getElementById("activeRequests").textContent = requests.filter((r) =>
    ["pending", "checked", "approved", "in_progress"].includes(r.status),
  ).length
  document.getElementById("completedRequests").textContent = requests.filter((r) => r.status === "completed").length

  
  if (issueTypesChartInstance) {
    issueTypesChartInstance.destroy()
    issueTypesChartInstance = null
  }
  if (locationsChartInstance) {
    locationsChartInstance.destroy()
    locationsChartInstance = null
  }

  
  const issueTypes = requests.reduce((acc, req) => {
    acc[req.issue_type] = (acc[req.issue_type] || 0) + 1
    return acc
  }, {})

  const issueTypesChart = document.getElementById("issueTypesChart")
  if (issueTypesChart && window.Chart) {
    issueTypesChartInstance = new Chart(issueTypesChart, {
      type: "doughnut",
      data: {
        labels: Object.keys(issueTypes),
        datasets: [
          {
            data: Object.values(issueTypes),
            backgroundColor: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  
  const locations = requests.reduce((acc, req) => {
    acc[req.location] = (acc[req.location] || 0) + 1
    return acc
  }, {})

  const locationsChart = document.getElementById("locationsChart")
  if (locationsChart && window.Chart) {
    locationsChartInstance = new Chart(locationsChart, {
      type: "bar",
      data: {
        labels: Object.keys(locations),
        datasets: [
          {
            label: "So'rovlar soni",
            data: Object.values(locations),
            backgroundColor: "#3B82F6",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }
}


const newRequestForm = document.getElementById("newRequestForm")
if (newRequestForm) {
  newRequestForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    const formData = window.ui.getFormData(this)

    try {
      const response = await window.api.createSupportRequest(formData)

      if (response.ok) {
        window.ui.showToast("So'rov muvaffaqiyatli yuborildi!")
        window.ui.closeModal("newRequestModal")
        this.reset()
        await loadUserRequests()
      } else {
        const error = await response.json()
        window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
      }
    } catch (error) {
      console.error("Request error:", error)
      window.ui.showToast("Tarmoq xatosi", "error")
    }
  })
}


const profileForm = document.getElementById("profileForm")
if (profileForm) {
  profileForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    const formData = window.ui.getFormData(this)

    try {
      
      const response = await window.api.updateUserMe(formData)

      if (response.ok) {
        
        window.auth.currentUser = { ...window.auth.currentUser, ...formData }
        localStorage.setItem("currentUser", JSON.stringify(window.auth.currentUser))

        
        const userGreeting = document.getElementById("userGreeting")
        if (userGreeting) {
          userGreeting.textContent = `Salom, ${window.auth.currentUser.first_name || window.auth.currentUser.email}!`
        }

        window.ui.showToast("Profil muvaffaqiyatli yangilandi!")
      } else {
        const error = await response.json()
        window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      window.ui.showToast("Tarmoq xatosi yoki server ishlamayapti", "error")
    }
  })
}


window.showSection = showSection
window.showManagerSection = showManagerSection
window.showMasterSection = showMasterSection
window.updateRequestStatus = updateRequestStatus
window.sendToMaster = sendToMaster


window.openCreateComponentModal = () => {
  window.ui.openModal("createComponentModal")
}

window.editComponent = async (componentId) => {
  const components = await window.api.getComponents()
  const component = await components.json()
  const currentComponent = component.find((component) => component._id === componentId)
      if (currentComponent) {
        console.log(currentComponent._id)
        document.getElementById("editComponentId").value = currentComponent._id
        document.getElementById("editComponentTitle").value = currentComponent.title
        document.getElementById("editComponentDescription").value = currentComponent.description
        document.getElementById("editComponentPrice").value = currentComponent.price
        document.getElementById("editComponentStock").value = currentComponent.in_stock
        window.ui.openModal("editComponentModal")
      } else {
        window.ui.showToast("Komponent topilmadi", "error")
      }
}

window.deleteComponent = async (componentId) => {
  if (confirm("Komponentni o'chirishni xohlaysizmi?")) {
    try {
      const response = await window.api.deleteComponent(componentId)
      if (response.ok) {
        window.ui.showToast("Komponent o'chirildi")
        loadManagerComponents()
      } else {
        window.ui.showToast("Xatolik yuz berdi", "error")
      }
    } catch (error) {
      console.error("Error deleting component:", error)
      window.ui.showToast("Tarmoq xatosi", "error")
    }
  }
}


window.openCreateUserModal = () => {
  window.ui.openModal("createUserModal")
}

window.editUser = async (userId) => {
  try {
    const response = await window.api.getUsers()
    if (response.ok) {
      const users = await response.json()
      const user = users.find((u) => u.id === userId)

      if (user) {
        
        document.getElementById("editUserId").value = user.id
        document.getElementById("editUserFirstName").value = user.first_name
        document.getElementById("editUserLastName").value = user.last_name
        document.getElementById("editUserEmail").value = user.email
        document.getElementById("editUserPhone").value = user.phone
        document.getElementById("editUserRole").value = user.role

        
        window.ui.openModal("editUserModal")
      } else {
        window.ui.showToast("Foydalanuvchi topilmadi", "error")
      }
    }
  } catch (error) {
    console.error("Error loading user:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}

window.deleteUser = async (userId) => {
  if (confirm("Foydalanuvchini o'chirishni xohlaysizmi?")) {
    try {
      const response = await window.api.deleteUser(userId)
      if (response.ok) {
        window.ui.showToast("Foydalanuvchi o'chirildi")
        loadManagerUsers()
      } else {
        window.ui.showToast("Xatolik yuz berdi", "error")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      window.ui.showToast("Tarmoq xatosi", "error")
    }
  }
}


window.openMasterEditModal = async (requestId) => {
  try {
    
    const componentsResponse = await window.api.getComponents()
    let components = []
    if (componentsResponse.ok) {
      components = await componentsResponse.json()
    }

    
    const requestElement = document.querySelector(`[data-request-id="${requestId}"]`)

    const  request = {
        id: requestId,
        component_id: requestElement.dataset.componentId || "",
        quantity: requestElement.dataset.quantity || 1,
        price: requestElement.dataset.price || "",
        end_date: requestElement.dataset.endDate || "",
      }

    if (request) {
      
      const componentSelect = document.getElementById("masterEditComponent")
      componentSelect.innerHTML = '<option value="">Komponent tanlang</option>'
      components.forEach((component) => {
        componentSelect.innerHTML += `<option value="${component._id}">${component.title} - $${component.price}</option>`
      })
      console.log(request)
      
      document.getElementById("masterEditRequestId").value = request.id
      document.getElementById("masterEditComponent").value = request.component_id || ""
      document.getElementById("masterEditQuantity").value = request.quantity || 1
      document.getElementById("masterEditPrice").value = request.price || ""

      
      if (request.end_date) {
        const date = new Date(request.end_date)
        const localDateTime = date.toISOString().slice(0, 16)
        document.getElementById("masterEditEndDate").value = localDateTime
      } else {
        
        const now = new Date()
        const localDateTime = now.toISOString().slice(0, 16)
        document.getElementById("masterEditEndDate").value = localDateTime
      }

      
      const now = new Date()
      const minDateTime = now.toISOString().slice(0, 16)
      document.getElementById("masterEditEndDate").min = minDateTime

      
      window.ui.openModal("masterEditModal")
    } else {
      window.ui.showToast("So'rov topilmadi", "error")
    }
  } catch (error) {
    console.error("Error opening master edit modal:", error)
    window.ui.showToast("Tarmoq xatosi", "error")
  }
}


const masterEditForm = document.getElementById("masterEditForm")
if (masterEditForm) {
  masterEditForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    const formData = window.ui.getFormData(this)

    console.log(formData)

    try {
      const updateData = {
        component_id: formData.component_id,
        quantity: Number.parseInt(formData.quantity),
        price: Number.parseFloat(formData.price),
        end_date: new Date(formData.end_date).toISOString(),
      }

      const response = await window.api.updateSupportMaster(formData.id, updateData)

      if (response.ok) {
        window.ui.showToast("So'rov yangilandi")
        window.ui.closeModal("masterEditModal")
        loadMasterRequests()
      } else {
        const error = await response.json()
        window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
      }
    } catch (error) {
      console.error("Error updating request:", error)
      window.ui.showToast("Tarmoq xatosi", "error")
    }
  })
}


document.addEventListener("DOMContentLoaded", () => {
  
  const createComponentForm = document.getElementById("createComponentForm")
  if (createComponentForm) {
    createComponentForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = window.ui.getFormData(this)

      try {
        const response = await window.api.createComponent({
          ...formData,
          price: Number.parseFloat(formData.price),
          in_stock: Number.parseInt(formData.in_stock),
        })

        if (response.ok) {
          window.ui.showToast("Komponent yaratildi")
          window.ui.closeModal("createComponentModal")
          this.reset()
          loadManagerComponents()
        } else {
          const error = await response.json()
          window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
        }
      } catch (error) {
        console.error("Error creating component:", error)
        window.ui.showToast("Tarmoq xatosi", "error")
      }
    })
  }

  
  const editComponentForm = document.getElementById("editComponentForm")
  if (editComponentForm) {
    editComponentForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = window.ui.getFormData(this)

      try {
        const response = await window.api.updateComponent(formData.id, {
          title: formData.title,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          in_stock: Number.parseInt(formData.in_stock),
        })

        if (response.ok) {
          window.ui.showToast("Komponent yangilandi")
          window.ui.closeModal("editComponentModal")
          loadManagerComponents()
        } else {
          const error = await response.json()
          window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
        }
      } catch (error) {
        console.error("Error updating component:", error)
        window.ui.showToast("Tarmoq xatosi", "error")
      }
    })
  }

  
  const createUserForm = document.getElementById("createUserForm")
  if (createUserForm) {
    createUserForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = window.ui.getFormData(this)

      try {
        const response = await window.api.createUser({...formData, person_type:"individual"})

        if (response.ok) {
          window.ui.showToast("Foydalanuvchi yaratildi")
          window.ui.closeModal("createUserModal")
          this.reset()
          loadManagerUsers()
        } else {
          const error = await response.json()
          window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
        }
      } catch (error) {
        console.error("Error creating user:", error)
        window.ui.showToast("Tarmoq xatosi", "error")
      }
    })
  }

  
  const editUserForm = document.getElementById("editUserForm")
  if (editUserForm) {
    editUserForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = window.ui.getFormData(this)

      try {
        const response = await window.api.updateUser(formData.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        })

        if (response.ok) {
          window.ui.showToast("Foydalanuvchi yangilandi")
          window.ui.closeModal("editUserModal")
          loadManagerUsers()
        } else {
          const error = await response.json()
          window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
        }
      } catch (error) {
        console.error("Error updating user:", error)
        window.ui.showToast("Tarmoq xatosi", "error")
      }
    })
  }
})

window.completeRequest = async (requestId) => {
  if (confirm("So'rovni tugallashni xohlaysizmi?")) {
    try {
      const response = await window.api.updateSupportStatus(requestId, "completed")
      if (response.ok) {
        window.ui.showToast("So'rov tugallandi")
        loadMasterRequests()
      } else {
        window.ui.showToast("Xatolik yuz berdi", "error")
      }
    } catch (error) {
      console.error("Error completing request:", error)
      window.ui.showToast("Tarmoq xatosi", "error")
    }
  }
}

window.acceptRequest = async (requestId) => {
  console.log(requestId)
  if (confirm("Ishimizni qabul qilishni xohlaysizmi?")) {
    try {
      const response = await window.api.updateSupportStatus(requestId, "in_progress")
      if (response.ok) {
        window.ui.showToast("So'rov qabul qilindi")
        loadMasterRequests()
      } else {
        window.ui.showToast("Xatolik yuz berdi", "error")
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      window.ui.showToast("Tarmoq xatosi", "error")
    }
  }
}
