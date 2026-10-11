"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "./store";
import { setCredentials, setInitialized } from "./slices/authSlice";
import { useRefreshTokenMutation } from "./api/authApi";

function SessionInitializer({ children }: { children: React.ReactNode }) {
  const [triggerRefresh] = useRefreshTokenMutation();
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      // Safety timeout: guarantee that the app never remains permanently stuck on the spinner
      const timeoutId = setTimeout(() => {
        dispatch(setInitialized());
      }, 3500);

      triggerRefresh()
        .unwrap()
        .then((res) => {
          clearTimeout(timeoutId);
          if (res?.accessToken && res?.user) {
            dispatch(
              setCredentials({
                accessToken: res.accessToken,
                user: res.user,
              }),
            );
          } else {
            dispatch(setInitialized());
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          dispatch(setInitialized());
        });
    }
  }, [triggerRefresh, dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionInitializer>{children}</SessionInitializer>
    </Provider>
  );
}
