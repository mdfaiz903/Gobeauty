from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    message = 'Admin privileges are required for this action.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'is_admin_role', False))
        )


class IsAdminRoleOrReadOnly(permissions.BasePermission):
    message = 'Admin privileges are required to modify this resource.'

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return IsAdminRole().has_permission(request, view)
