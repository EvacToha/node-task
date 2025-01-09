import React, { useEffect } from "react";
import { Field, Form, FormElement } from "@progress/kendo-react-form";

import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { apiClient } from "../axios";
import { Token, ErrorData } from "../interfaces";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Error } from "@progress/kendo-react-labels";

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem("jwt");
  }, []);

  const fetchLoginUser = async (dataItem: { [name: string]: unknown }) => {
    try {
      console.log(dataItem);
      const response = await apiClient.post<Token>(`/User/Login`, dataItem);

      localStorage.setItem("jwt", response.data.token);
      navigate("/modal-nodes");
    } catch (err) {
      setError(((err as AxiosError).response!.data as ErrorData).message);
    }
  };

  const handleSubmit = async (dataItem: { [name: string]: unknown }) => {
    await fetchLoginUser(dataItem);
  };

  return (
    <div className="k-form-field-wrap">
      <Form
        onSubmit={handleSubmit}
        render={() => (
          <FormElement>
            <Field label="Логин" name="login" component={Input} />
            <Field
              label="Пароль"
              name="password"
              type="password"
              component={Input}
            />
            <Button type="submit">Войти</Button>
            {error && <Error> {error} </Error>}
          </FormElement>
        )}
      />
    </div>
  );
};

export default LoginPage;
