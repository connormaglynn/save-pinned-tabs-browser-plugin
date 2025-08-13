import { GroupEntity } from "../repositories/groupRepository.js"
import { PreferencesModel } from "../repositories/preferencesRepository.js"

export class EditGroupView {
  /** @param {GroupService} groupService @param {object} clickEvents **/
  constructor(groupService, clickEvents) {
    this.groupService = groupService
    this.editGroupUrlsListView = new EditGroupUrlsListView(groupService, clickEvents)
  }

  /** @async @param {GroupEntity>} group @param {PreferencesModel} preferences  */
  async open(group, preferences) {
    const mainContent = document.getElementsByClassName("main-wrapper")[0]
    mainContent.inert = true
    document.getElementById("edit-overlay").dataset.groupId = group?.id
    document.getElementById("removeEditWrapperButton").dataset.groupId = group?.id
    document.getElementById("saveEditWrapperButton").dataset.groupId = group?.id

    let autoloadIsEnabled = false
    if (preferences.groupIdToLoadOnStartup === group.id) {
      autoloadIsEnabled = true
    }
    document.getElementById("loadOnStartupCheckbox").checked = autoloadIsEnabled

    const editOverlayElement = document.getElementById("edit-overlay")
    editOverlayElement.classList.add("show")

    const editGroupNameElement = document.getElementById("edit-group-name")
    editGroupNameElement.value = group?.name

    await this.editGroupUrlsListView.replace(group.pinnedTabsUrls)
  }

  close() {
    const editOverlayElement = document.getElementById("edit-overlay")
    editOverlayElement.classList.remove("show")

    const mainContent = document.getElementsByClassName("main-wrapper")[0]
    mainContent.inert = false
  }

  /** @returns {{group: GroupEntity, isLoadOnStartup: boolean}} **/
  getValues() {
    const groupId = document.getElementById("edit-overlay").dataset.groupId
    const newName = document.getElementById("edit-group-name").value
    const isLoadOnStartup = document.getElementById("loadOnStartupCheckbox").checked
    const newPinnedTabsUrls = this.editGroupUrlsListView.getValues()

    return {
      group: new GroupEntity(groupId, newName, newPinnedTabsUrls),
      isLoadOnStartup: isLoadOnStartup,
    }
  }
}

export class EditGroupUrlsListView {
  /** @param {GroupService} groupService @param {object} clickEvents **/
  constructor(groupService, clickEvents) {
    this.id = "editGroupsUrlsList"
    this.groupService = groupService
    this.clickEvents = clickEvents
  }

  /** @async @param {Array<string>} urls  */
  async replace(urls) {
    this.close()
    await this.open(urls)
  }

  /** @async @param {Array<string>} urls  */
  async open(urls) {
    const editGroupsUrlsList = document.getElementById(this.id)
    for (const [index, url] of urls.entries()) {
      await this.appendUrlInput(editGroupsUrlsList, url, index)
    }
  }

  close() {
    const editGroupsUrlsList = document.getElementById(this.id)
    while (editGroupsUrlsList.firstChild) {
      editGroupsUrlsList.removeChild(editGroupsUrlsList.lastChild)
    }
  }

  /** @async @param {HTMLElement} editGroupsUrlsListElement @param {string} url  @param {number} index **/
  async appendUrlInput(editGroupsUrlsListElement, url, index) {
    const faviconImageElement = document.createElement("img")
    faviconImageElement.dataset.index = index
    faviconImageElement.classList.add("favicon")
    faviconImageElement.draggable = false
    try {
      const domain = new URL(url).host
      faviconImageElement.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`
    } catch (e) {
      faviconImageElement.src = "../assets/icons/favicon-16x16.png"
    }

    const urlInputElement = await this.createUrlInputElement(url, index)

    const removeButtonElement = document.createElement("span")
    removeButtonElement.dataset.index = index
    removeButtonElement.dataset.clickEvent = this.clickEvents.REMOVE_URL_FROM_GROUP_BY_INDEX
    removeButtonElement.dataset.clickOnEnterPress = "true"
    removeButtonElement.tabIndex = 1
    removeButtonElement.classList.add("remove")
    removeButtonElement.appendChild(document.createTextNode("Remove"))

    const urlWrapperElement = document.createElement("div")
    urlWrapperElement.dataset.index = index
    urlWrapperElement.classList.add("edit-url-wrapper")
    urlWrapperElement.draggable = true
    urlWrapperElement.addEventListener("dragstart", this.dragStartHandler)
    urlWrapperElement.ondrop = this.dropHandler
    urlWrapperElement.ondragover = this.dragoverHandler

    urlWrapperElement.appendChild(faviconImageElement)
    urlWrapperElement.appendChild(urlInputElement)
    urlWrapperElement.appendChild(removeButtonElement)

    editGroupsUrlsListElement.appendChild(urlWrapperElement)
  }

  /** @async @returns {HTMLElement} @param {string} url @param {number} index **/
  async createUrlInputElement(url, index) {
    let urlElement

    if (this.groupService.urlIsGroupComponent(url)) {
      urlElement = document.createElement("select")
      const groups = await this.groupService.findAll()
      for (const group of groups) {
        const groupComponentUrl = this.groupService.createGroupComponentUrlFromGroupComponentId(group.id)
        const optionElement = document.createElement("option")
        optionElement.value = groupComponentUrl
        optionElement.textContent = group.name
        if (groupComponentUrl === url) {
          optionElement.selected = true
        }
        urlElement.appendChild(optionElement)
      }
    } else {
      urlElement = document.createElement("input")
    }

    urlElement.dataset.index = index
    urlElement.classList.add("edit-url")
    urlElement.value = url || ''

    return urlElement
  }

  /** @returns {Array<string>} **/
  getValues() {
    const newPinnedTabsUrls = []
    document.getElementById(this.id).childNodes.forEach((child) => newPinnedTabsUrls.push(child.querySelector("input")?.value || child.querySelector("select :checked")?.value || ''))
    return newPinnedTabsUrls
  }

  dragStartHandler = (event) => {
    event.dataTransfer.setData('text', event.target.dataset.index);
    event.dataTransfer.dropEffect = "move"
  }

  dragoverHandler = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  dropHandler = async (event) => {
    event.preventDefault()
    const movingItemIndex = event.dataTransfer.getData("text")
    const targetItemIndex = event.target.dataset.index
    const urls = this.getValues()
    const movingItemUrl = urls[movingItemIndex]
    const filteredUrls = urls.filter((_, index) => Number(movingItemIndex) !== Number(index))
    const newUrlOrder = filteredUrls.toSpliced(targetItemIndex, 0, movingItemUrl)
    await this.replace(newUrlOrder)
  }
}
