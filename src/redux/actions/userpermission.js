export const USER_PERMISSION = "USER_PERMISSION";

export const setUserPermission = (permission) => ({
  type: USER_PERMISSION,
  payload: permission
});