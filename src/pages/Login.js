import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { AuthContext } from '../context/auth';
import { useForm } from '../util/hooks';

function Login(props) {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [attempts, setAttempts] = useState(0)

  const { onChange, onSubmit, values } = useForm(loginUserCallback, {
    userName: '',
    password: ''
  });

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(
      _,
      {
        data: { login: userData }
      }
    ) {
      context.login(userData);
      props.history.push('/');
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values
  });

  function loginUserCallback() {
    loginUser();
  }

  useEffect(() => {
    if (errors.general) {
      setAttempts(attempts + 1)
    }
  }, [errors])

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate className={loading ? 'Carregando...' : ''}>
        <h1>Login</h1>
        <Form.Input
          label="Username"
          placeholder="Digite o username"
          name="userName"
          type="text"
          value={values.userName}
          error={errors.userName ? true : false}
          onChange={onChange}
        />
        <Form.Input
          label="Password"
          placeholder="Digite a senha"
          name="password"
          type="password"
          value={values.password}
          error={errors.password ? true : false}
          onChange={onChange}
        />
        <Button 
          type="submit" 
          disabled={attempts === 3}
          primary>
          Login
        </Button>
        {
          attempts === 3
          && (
            <div className="error-message">Você alcançou o máximo de tentativas.</div>
          )
        }
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const LOGIN_USER = gql`
  mutation login($userName: String!, $password: String!) {
    login(userName: $userName, password: $password) {
      id
      email
      userName
      createdAt
      token
    }
  }
`;

export default Login;