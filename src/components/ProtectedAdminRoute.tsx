import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedAdminRouteProps extends RouteProps {
  component?: React.ComponentType<any>;
  render?: (props: any) => React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  component: Component,
  render,
  ...rest
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <Route
      {...rest}
      render={props => {
        if (!isAuthenticated) {
          // 로그인하지 않은 경우
          return <Redirect to="/auth/login" />;
        }

        if (!user || user.role !== 'admin') {
          // 관리자가 아닌 경우
          return <Redirect to="/tabs" />;
        }

        // 관리자인 경우
        if (Component) {
          return <Component {...props} />;
        }
        if (render) {
          return render(props);
        }
        return null;
      }}
    />
  );
};

export default ProtectedAdminRoute; 