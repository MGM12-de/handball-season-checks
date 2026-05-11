import { useLocalStorage } from '@vueuse/core'

export interface FavoriteClub {
  id: string
  name: string
  logo?: string
  acronym?: string
  organizationName?: string
}

export interface FavoriteTeam {
  id: string
  name: string
  logo?: string
  tournamentAcronym?: string
}

export function useFavorites() {
  const favoriteClubs = useLocalStorage<FavoriteClub[]>('favorites-clubs', [])
  const favoriteTeams = useLocalStorage<FavoriteTeam[]>('favorites-teams', [])

  const isFavoriteClub = (id: string) => favoriteClubs.value.some(c => c.id === id)
  const isFavoriteTeam = (id: string) => favoriteTeams.value.some(t => t.id === id)

  const toggleFavoriteClub = (club: FavoriteClub) => {
    if (isFavoriteClub(club.id)) {
      favoriteClubs.value = favoriteClubs.value.filter(c => c.id !== club.id)
    }
    else {
      favoriteClubs.value.push(club)
    }
  }

  const toggleFavoriteTeam = (team: FavoriteTeam) => {
    if (isFavoriteTeam(team.id)) {
      favoriteTeams.value = favoriteTeams.value.filter(t => t.id !== team.id)
    }
    else {
      favoriteTeams.value.push(team)
    }
  }

  return {
    favoriteClubs,
    favoriteTeams,
    isFavoriteClub,
    isFavoriteTeam,
    toggleFavoriteClub,
    toggleFavoriteTeam,
  }
}
