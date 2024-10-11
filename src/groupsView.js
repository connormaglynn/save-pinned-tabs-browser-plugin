class GroupView {
  constructor(groupRepository, clickEvents) {
    this.groupRepository = groupRepository
    this.clickEvents = clickEvents
  }

  displayStoredGroups = async () => {
    console.info("🖼️ Called displayStoredGroups()")
    const groups = await this.groupRepository.findAll()

    const groupsDisplay = document.getElementById("groupsDisplay")
    while (groupsDisplay.firstChild) {
      groupsDisplay.removeChild(groupsDisplay.lastChild)
    }

    groups.forEach((group, index) => {
      const groupElement = this.createGroupItemElement(group?.name, group?.id)
      groupsDisplay.appendChild(groupElement)
      if (index === 0) groupElement.focus()
    })
  }

  dragStartHandler = (event) => {
    event.dataTransfer.setData("text/plain", event.target.dataset.groupId)
    event.dataTransfer.dropEffect = "move"
  }
  dragoverHandler = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }
  dropHandler = async (event) => {
    event.preventDefault()
    const movingItemGroupId = event.dataTransfer.getData("text/plain")
    const targetItemGroupId = event.target.dataset.groupId

    await this.groupRepository.moveItemOrder(movingItemGroupId, targetItemGroupId)
    this.displayStoredGroups()
  }
  createGroupItemElement = (groupName, groupId) => {
    const nameElement = document.createElement("span")
    nameElement.dataset.groupId = groupId
    nameElement.dataset.clickEvent = this.clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT
    nameElement.dataset.clickOnEnterPress = "true"
    nameElement.classList.add("group-name")
    nameElement.appendChild(document.createTextNode(groupName))

    const editElement = document.createElement("span")
    editElement.dataset.groupId = groupId
    editElement.dataset.clickEvent = this.clickEvents.OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT
    editElement.dataset.clickOnEnterPress = "true"
    editElement.classList.add("edit-button")
    editElement.role = "button"
    editElement.tabIndex = 3
    editElement.appendChild(document.createTextNode("Edit"))

    const groupElement = document.createElement("div")
    groupElement.dataset.groupId = groupId
    groupElement.dataset.clickEvent = this.clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT
    groupElement.dataset.clickOnEnterPress = "true"
    groupElement.classList.add("group-item")
    groupElement.role = "button"
    groupElement.tabIndex = 0
    groupElement.draggable = true
    groupElement.addEventListener("dragstart", this.dragStartHandler)
    groupElement.ondrop = this.dropHandler
    groupElement.ondragover = this.dragoverHandler
    groupElement.appendChild(nameElement)
    groupElement.appendChild(editElement)

    return groupElement
  }

}
