import React, { useCallback, useRef, ChangeEvent } from 'react';
import { FiMail, FiUserCheck, FiLock, FiCamera, FiArrowLeft } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useHistory, Link } from 'react-router-dom';

import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { useToast } from '../../hooks/toast';

import { Container, Content, AvatarInput } from './styles';
import { useAuth } from '../../hooks/auth';
import { ConvertToBase64, getBase64 } from '../../utils/getbase64';

interface DescricaoFormData {
  descricao: string;
}

const Descricao: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();

  const { user, signOut } = useAuth();

  const handleSubmit = useCallback(
    async (data: DescricaoFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          descricao: Yup.string().required('Descrição é obrigatório'),
        });

        await schema.validate(data, { abortEarly: false });

        const {
          descricao
        } = data;

        await api.post('/providers/atualizarDescricao', data);

        signOut()

        addToast({
          type: 'success',
          title: 'Descrição atualizado!',
          description:
            'Suas informações de descrição foram atualizadas com sucesso!',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        addToast({
          type: 'error',
          title: 'Erro na atualização',
          description:
            'Ocorreu um error ao atualizar a descrição, tente novamente.',
        });
      }
    },
    [addToast, history],
  );

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
          initialData={{ descricao: user.descricao}}
          onSubmit={handleSubmit}
        >
          <AvatarInput>
            <img
              src={
                user.avatar_url ||
                'https://api.adorable.io/avatars/186/abott@adorable.io.png'
              }
              alt={user.name}
            />
          </AvatarInput>

          <h1>Descrição do Perfil</h1>

          <Input name="descricao" type="text" icon={FiUserCheck} placeholder="Insira sua descrição" />

          <Button type="submit">Confirmar Descrição</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default Descricao;
