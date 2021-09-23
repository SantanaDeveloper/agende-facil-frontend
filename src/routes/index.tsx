import React from 'react';
import { Switch } from 'react-router-dom';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import UpdateAvailability from '../pages/UpdateAvailability';

import Route from './Route';
import Clientes from '../pages/Clientes';
import AtualizarValidade from '../pages/AtualizarValidade';
import Descricao from '../pages/Descricao';

const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={SignIn} />
    <Route path="/signup" component={SignUp} />
    <Route path="/forgot-password" component={ForgotPassword} />
    <Route path="/reset-password" component={ResetPassword} />

    <Route path="/dashboard" component={Dashboard} isPrivate />
    <Route path="/clientes" component={Clientes} isPrivate />
    <Route path="/alterar-validade/:id" component={AtualizarValidade} isPrivate />
    <Route
      path="/atualizar-disponibilidade"
      component={UpdateAvailability}
      isPrivate
    />
    <Route path="/profile" component={Profile} isPrivate />
    <Route path="/descricao" component={Descricao} isPrivate />
  </Switch>
);

export default Routes;
