// Autenticação simulada — sem tabela user, sem backend de auth.
// Credenciais de demonstração; o "login" só valida no browser.
const STORAGE_KEY = "firelink_user";

const DEMO_USERS = [
  { username: "tecnico", password: "gorongosa", role: "Técnico de monitoria", name: "Técnico de Monitoria" },
  { username: "campo",   password: "gorongosa", role: "Equipa de campo",       name: "Equipa de Campo" },
  { username: "admin",   password: "gorongosa", role: "Gestor da aplicação",   name: "Gestor" },
];

export function login(username, password) {
  const u = DEMO_USERS.find(
    (x) => x.username === username.trim().toLowerCase() && x.password === password
  );
  if (!u) return null;
  const user = { username: u.username, role: u.role, name: u.name, loginAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function currentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const DEMO_CREDENTIALS = DEMO_USERS.map((u) => ({
  username: u.username,
  password: u.password,
  role: u.role,
}));