/**
 * Projects Index Page
 * /projects
 *
 * Parent route for Projects. Renders its own content at /projects
 * and child pages (Tasks, Epics, Stories) via nested routing.
 *
 * Note: <Outlet /> is NOT needed here unless you want child routes
 * to render WITHIN this page's layout. Since children are full pages,
 * AppRoutes handles them as separate index children.
 */

import PagePlaceholder from '../../components/ui/PagePlaceholder'

export default function Projects() {
  return (
    <PagePlaceholder
      title="Projects"
      description="Manage all your projects, epics, and stories."
      icon="FolderKanban"
      color="blue"
    />
  )
}
