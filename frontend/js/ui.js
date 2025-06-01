
const ui = {
  
  openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("hidden")
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.add("hidden")
    }
  },

  
  showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    const toastMessage = document.getElementById("toastMessage")

    if (toast && toastMessage) {
      toastMessage.textContent = message

      
      toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
      } text-white`

      toast.classList.remove("hidden")

      
      setTimeout(() => {
        toast.classList.add("hidden")
      }, 3000)
    }
  },

  
  getFormData(formElement) {
    const formData = new FormData(formElement)
    const data = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }
    return data
  },

  populateForm(formElement, data, without) {
    for (const [key, value] of Object.entries(data)) {
      if (key !== without) {
        const input = formElement.querySelector(`[name="${key}"]`)
        if (input) {
          input.value = value || ""
        }
      }
    }
  },

  
  getStatusBadge(status) {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      checked: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-gray-100 text-gray-800",
    }

    const statusTexts = {
      pending: "Kutilmoqda",
      checked: "Tekshirildi",
      approved: "Tasdiqlandi",
      in_progress: "Jarayonda",
      rejected: "Rad etildi",
      completed: "Tugallandi",
    }

    const className = statusClasses[status] || "bg-gray-100 text-gray-800"
    const text = statusTexts[status] || status

    return `<span class="px-2 py-1 text-xs font-medium rounded-full ${className}">${text}</span>`
  },

  
  getIssueTypeIcon(issueType) {
    const icons = {
      hardware: "fas fa-laptop",
      software: "fas fa-code",
      network: "fas fa-wifi",
      other: "fas fa-cog",
    }
    return icons[issueType] || "fas fa-question"
  },
}


function openModal(modalId) {
  ui.openModal(modalId)
}

function closeModal(modalId) {
  ui.closeModal(modalId)
}

function logout() {
  window.auth.logout()
}

function toggleCompanyField(personType) {
  const companyField = document.getElementById("companyField")
  if (companyField) {
    if (personType === "legal") {
      companyField.classList.remove("hidden")
      companyField.querySelector("input").required = true
    } else {
      companyField.classList.add("hidden")
      companyField.querySelector("input").required = false
    }
  }
}


let currentStep = 1
let userInfoData = {}

function nextStep() {
  const userInfoForm = document.getElementById("userInfoForm")
  const formData = ui.getFormData(userInfoForm)

  
  if (!formData.full_name || !formData.email || !formData.phone) {
    ui.showToast("Barcha maydonlarni to'ldiring", "error")
    return
  }

  userInfoData = formData

  
  document.getElementById("step1Indicator").className =
    "w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
  document.getElementById("step2Indicator").className =
    "w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium"

  
  document.getElementById("step1").classList.add("hidden")
  document.getElementById("step2").classList.remove("hidden")

  currentStep = 2
}

function prevStep() {
  
  document.getElementById("step1Indicator").className =
    "w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
  document.getElementById("step2Indicator").className =
    "w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium"

  
  document.getElementById("step1").classList.remove("hidden")
  document.getElementById("step2").classList.add("hidden")

  currentStep = 1
}


window.ui = ui
