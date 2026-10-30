export interface Release {
  version: string
  features: string[]
  fixes: string[]
}

const VERSION_SEPARATOR = '.'

function compareVersions(first: string, second: string): number {
  const firstParts = first.split(VERSION_SEPARATOR).map(Number)
  const secondParts = second.split(VERSION_SEPARATOR).map(Number)
  const difference = firstParts.map((part, index) => part - secondParts[index]).find((delta) => delta !== 0)

  return difference === undefined ? 0 : difference
}

export const newestFirst = (releases: Release[]) =>
  [...releases].sort((first, second) => compareVersions(second.version, first.version))

export function unseenReleases(changelog: Release[], seen: string | null, current: string): Release[] {
  if (seen === null) {
    return changelog.filter((release) => release.version === current)
  }

  return newestFirst(changelog).filter(
    (release) => compareVersions(release.version, seen) > 0 && compareVersions(release.version, current) <= 0,
  )
}
