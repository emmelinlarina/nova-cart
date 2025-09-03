export function saveUser(data) {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', data.name);
    localStorage.setItem('email', data.email);
  }
  
  export function getUser() {
    return localStorage.getItem('user');
  }
  
  export function getToken() {
    return localStorage.getItem('token');
  }
  
  export function logoutUser() {
    localStorage.clear();
  }