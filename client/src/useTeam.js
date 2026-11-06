import { useEffect, useState } from 'react';
import { api } from './api.js';

/** Nama-nama anggota kelompok (endpoint publik, tanpa NIM). */
export function useTeam() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    api('/auth/team')
      .then((data) => setTeam(data.team))
      .catch(() => {});
  }, []);

  return team;
}
