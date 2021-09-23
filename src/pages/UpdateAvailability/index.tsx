import React, { useCallback, useRef } from 'react';
import { FiClock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';

import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';

import { useToast } from '../../hooks/toast';

import { Container, Content, AnimationContainer, Background } from './styles';

import logoImg from '../../assets/logo.svg';

interface AvailabilityFormData {
  inicio: Date;
  final: Date;
  duracao: Number;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();

  const handleSubmit = useCallback(
    async (data: AvailabilityFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          inicio: Yup.string().required('Início é obrigatório'),
          final: Yup.string().required('Final é obrigatório'),
          duracao: Yup.string().required('Duração é obrigatório'),
        });
        await schema.validate(data, { abortEarly: false });

        await api.post('/providers/disponibilidade', data);

        history.push('/dashboard');

        addToast({
          type: 'success',
          title: 'Horário atualizado!',
          description: 'Você já pode fazer seu logon no Agende Fácil!',
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
            'Ocorreu um error ao atualizar seu horário de atendimento, tente novamente.',
        });
      }
    },
    [addToast, history],
  );

  return (
    <Container>
      <Background />
      <Content>
        <AnimationContainer>
          <img src={logoImg} style={{ width: '6em' }} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Horário de atendimento</h1>
            <div>
              <label htmlFor="inicio">Início</label>
              <Input type="time" id="inicio" name="inicio" icon={FiClock} />
            </div>

            <div>
              <label htmlFor="final">Final</label>
              <Input type="time" id="final" name="final" icon={FiClock} />
            </div>

            <div>
              <label htmlFor="duracao">Duração média</label>
              <Select
                name="duracao"
                id="duracao"
                icon={FiClock}
                defaultValue={0}
              >
                <option value="0" disabled hidden>
                  --
                </option>
                <option value="15">15 Minutos</option>
                <option value="30">30 Minutos</option>
                <option value="45">45 Minutos</option>
                <option value="60">1 Hora</option>
                <option value="75">1 Hora e 15 Minutos</option>
                <option value="90">1 Hora e 30 Minutos</option>
                <option value="105">1 Hora e 45 Minutos</option>
                <option value="120">2 Horas</option>
              </Select>
            </div>

            <Button type="submit">Continuar</Button>
          </Form>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default SignUp;
