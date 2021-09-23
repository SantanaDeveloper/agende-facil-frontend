import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  body {
    background: #312E38;
    color: #f4ede8;
    -webkit-font-smoothing: antialiased;
  }

  body, input, button, select {
    font-family: 'Roboto Slab', serif;
    font-size: 16px;
  }

  h1, h2, h3, h4, h5, h6, strong {
    font-weight: 500;
  }

  button {
    cursor: pointer;
  }

  /* input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active  {
    box-shadow: 0 0 0px 1000px #232129 inset;
    transition: "color 9999s ease-out, background-color 9999s ease-out";
    transition-delay: 9999s;
  } */

  .alert {
  width: 100%;
  padding: 20px 16px;
  border-radius: 8px;
  border-style: none;
  border-width: 1px;
  margin-bottom: 1em;
  margin-top: 1em;
  font-size: 16px;
  font-family: 'Roboto Slab', serif;
    font-size: 16px;
}

.alert.alert-danger {
  background-color: rgb(208 46 54 / 78%);
  border-color: rgba(220, 53, 69, 1);
  color: #FFFFFF;
}
`;
