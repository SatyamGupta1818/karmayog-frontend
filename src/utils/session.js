export function safelyParseStoredJson(key) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function getStoredUser(authUser) {
  let userData = safelyParseStoredJson('users')

  if (Array.isArray(userData)) {
    userData = authUser?.email
      ? userData.find((user) => user.email === authUser.email) || userData[0]
      : userData[0]
  }

  return userData || authUser || null
}

export function getUserDisplayDetails(authUser) {
  const userData = getStoredUser(authUser)
  const firstName = userData?.firstName || authUser?.firstName || ''
  const lastName = userData?.lastName || authUser?.lastName || ''
  const email = userData?.email || authUser?.email || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    displayName: fullName || userData?.name || 'Unknown User',
    email,
  }
}

export function normalizeOrganization(organization) {
  if (!organization || typeof organization !== 'object') {
    return null
  }

  const id = organization.id
    || organization.organizationId
    || organization.orgId
    || organization._id
    || ''

  const name = organization.organizationName
    || organization.name
    || organization.orgName
    || organization.companyName
    || ''

  return {
    id: id ? String(id) : '',
    name,
    email: organization.orgEmail || organization.email || '',
    type: organization.organizationType || organization.type || '',
    size: organization.organizationSize || organization.size || '',
    raw: organization,
  }
}

export function getOrganizationDetails(authUser) {
  const storedOrganization = safelyParseStoredJson('organization')
  const userData = getStoredUser(authUser)
  const candidates = [
    storedOrganization,
    authUser?.organization,
    authUser?.activeOrganization,
    authUser?.org,
    userData?.organization,
    userData?.activeOrganization,
    userData?.org,
    authUser,
    userData,
  ]

  const normalized = candidates.map(normalizeOrganization).find((organization) => organization?.name)

  return normalized || {
    id: '',
    name: 'Organization',
    email: '',
    type: '',
    size: '',
    raw: null,
  }
}
