export interface Användare {
  id: number;
  namn: string;
  epost: string;
}

export interface Användarerad extends Användare {
  losenord: string;
}

//recensionsobjekt
export interface Recensionsrad {
  id: number;
  bokId: string;
  användareId: number;
  användarnamn: string;
  text: string;
  betyg: number;
  skapadDatum: string;
}

//jwt payload
export interface JWTPayload {
  id: number;
  epost: string;
}
