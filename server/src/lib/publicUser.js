const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  photoUrl: true,
  language: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl,
    language: user.language,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export { SAFE_USER_SELECT };
