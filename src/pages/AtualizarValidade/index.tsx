import React, { useCallback, useRef, useEffect, useState } from 'react';
import { FiMail, FiUser, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useHistory, Link, useParams } from 'react-router-dom';

import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { useToast } from '../../hooks/toast';

import { Container, Content, AvatarInput } from './styles';
import { useAuth } from '../../hooks/auth';

interface ValidadeFormData {
  id: string;
  validade: Date;
}

interface User {
  id: number;
  nome: string;
  email: string;
  avatar_url: string;
  validade: Date;
}

const AtualizarValidade: React.FC = () => {
  const { id } = useParams();

  useEffect(() => {
    const isAdmin = user.roles.includes("ROLE_ADMIN")
    if(!isAdmin) history.push('/')
  }, []);

  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();
  const [usuario, setUsuario] = useState<User>(null);
  useEffect(() => {
    api
      .get<User>('/providers/g/' + id)
      .then(response => {
        setUsuario(response.data);
      });
  }, []);
  const { user, updateUser } = useAuth();

  const handleSubmit = useCallback(
    async (data: ValidadeFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          validade: Yup.string().required('Validade é obrigatório'),
        });
        await schema.validate(data, { abortEarly: false });
        data.id = id;
        await api.post('/providers/atualizarValidade', data);

        history.push('/');

        addToast({
          type: 'success',
          title: 'Dados atualizados!',
          description: 'A validade foi atualizada!',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        addToast({
          type: 'error',
          title: 'Erro na definição dos dados',
          description:
            'Ocorreu um error ao atualizar a validade, tente novamente.',
        });
      }
    },
    [addToast, history],
  );
  if(usuario == null) return null
  return (
    <Container>
      <header>
        <div>
          <Link to="/dashboard">
            <FiArrowLeft size={32} />
          </Link>
        </div>
      </header>
      <Content>
        <Form
          ref={formRef}
          initialData={{ name: usuario.nome, email: usuario.email, validade: usuario.validade }}
          onSubmit={handleSubmit}
        >
          <AvatarInput>
            <img
              src={
                usuario.avatar_url ||
                'https://api.adorable.io/avatars/186/abott@adorable.io.png'
              }
              alt={usuario.nome}
            />
          </AvatarInput>

          <h1>Perfil - {usuario.nome}</h1>

          <Input name="name" icon={FiUser} placeholder="Nome" disabled/>

          <Input name="email" icon={FiMail} placeholder="E-mail" disabled/>

          <Input name="validade" type="date" icon={FiCalendar} placeholder="E-mail" />

          <Button type="submit">Atualizar Validade</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default AtualizarValidade;
