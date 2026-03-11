# BookBase – Backend

REST API för BookBase byggt med Express.js och SQLite.

## Tekniker

- Node.js + Express.js
- Typescript
- SQLite 
- JWT 
- bcrypt

## Kom igång

### 1. Klona och installera

```bash
git clone https://github.com/arlaspresident/bookcase-backend.git
cd bookcase-backend
npm install
```

### 2. Miljövariabler

Skapa en `.env`-fil i rooten:

```
JWT_SECRET=hemligt
PORT=3001
```

### 3. Starta servern

```bash
npm run dev     
npm start      
```

Servern körs på `http://localhost:3001`

---

## API endpoints

- `POST /api/auth/registrera` - skapa nytt konto
- `POST /api/auth/logga-in` - logga in
- `GET /api/recensioner/:bokId` - hämta recensioner för en bok
- `GET /api/recensioner/mina` - hämta egna recensioner
- `POST /api/recensioner` - skapa recension
- `PUT /api/recensioner/:id` - uppdatera recension
- `DELETE /api/recensioner/:id` - ta bort recension
