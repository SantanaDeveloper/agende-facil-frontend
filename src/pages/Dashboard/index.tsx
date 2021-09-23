import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { isToday, format, parseISO, isAfter } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import {
  FiPower,
  FiClock,
  FiXCircle,
  FiUser,
  FiCalendar,
  FiEdit
} from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Link, useHistory } from 'react-router-dom';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useToast } from '../../hooks/toast';
import * as S from './styles';

import logoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import getValidationErrors from '../../utils/getValidationErrors';

interface MonthAvailabilityItem {
  day: number;
  available: boolean;
}

interface Appointment {
  id: string;
  date: string;
  hourFormatted: string;
  user: {
    name: string;
    avatar_url: string;
  };
}

interface AppointmentFormData {
  nome: string;
  data_agendamento: Date;
  hora_agendamento: Date;
}

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const { addToast } = useToast();
  const history = useHistory();
  const formRef = useRef<FormHandles>(null);
  const handleSubmit = useCallback(
    async (data: AppointmentFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          nome: Yup.string().required('Nome é obrigatório'),
          data_agendamento: Yup.date(),
        });

        await schema.validate(data, { abortEarly: false });

        const d = new Date(data.data_agendamento);
        const dia = d.getUTCDate();
        const mes = d.getUTCMonth();
        const ano = d.getUTCFullYear();
        const hora = data.hora_agendamento.toString().split(':');
        const dataAgendamento = new Date(
          Date.UTC(ano, mes, dia, parseInt(hora[0]), parseInt(hora[1])),
        );
        await api.post('/appointments/new', {
          date: dataAgendamento,
          fornecedor_id: user.id,
          nome: data.nome,
        });
        getAppointments();
        setisOpenAppointment(false);
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        }

        addToast({
          type: 'error',
          title: 'Erro no agendamento',
          description: 'Já existe outro cliente agendado neste periodo!',
        });
      }
    },
    [addToast],
  );

  const [isValid, setIsValid] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthAvailability, setMonthAvailability] = useState<
    MonthAvailabilityItem[]
  >([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [isOpenAppointment, setisOpenAppointment] = useState(false);

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  useEffect(() => {
    const tempo = new Date();
    const validade = new Date(user.validade);
    setIsValid(tempo < validade);
  }, []);

  // useEffect(() => {
  //   api
  //     .get(`/providers/${user.id}/month-availability`, {
  //       params: {
  //         year: currentMonth.getFullYear(),
  //         month: currentMonth.getMonth() + 1,
  //       },
  //     })
  //     .then(response => setMonthAvailability(response.data));
  // }, [currentMonth, user.id]);

  const getAppointments = () => {
    api
      .get<Appointment[]>('/appointments/me', {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => {
        const appointmentsFormatted = response.data.map(appointment => ({
          ...appointment,
          hourFormatted: format(
            parseISO(appointment.date.replace('.000Z', '')),
            'HH:mm',
          ),
        }));

        setAppointments(appointmentsFormatted);
      });
  };

  useEffect(() => {
    api
      .get<Appointment[]>('/appointments/me', {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => {
        const appointmentsFormatted = response.data.map(appointment => ({
          ...appointment,
          hourFormatted: format(
            parseISO(appointment.date.replace('.000Z', '')),
            'HH:mm',
          ),
        }));

        setAppointments(appointmentsFormatted);
      });
  }, [selectedDate]);

  useEffect(() => {
    api
      .get('/providers/disponibilidade')
      .then(response => {
        if (!response.data.disponivel)
          history.push('/atualizar-disponibilidade');
      })
      .catch(err => {
        localStorage.removeItem('@GoBarber:token');
        localStorage.removeItem('@GoBarber:user');
        history.push('/');
      });
  });

  const disableDays = useMemo(() => {
    return monthAvailability
      .filter(monthDay => monthDay.available === false)
      .map(monthDay => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        return new Date(year, month, monthDay.day);
      });
  }, [currentMonth, monthAvailability]);

  const selectedDateAsText = useMemo(() => {
    return format(selectedDate, "'Dia' dd 'de' MMMM", { locale: ptBR });
  }, [selectedDate]);

  const selectedWeekDay = useMemo(() => {
    return format(selectedDate, 'cccc', { locale: ptBR });
  }, [selectedDate]);

  const morningAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date.replace('.000Z', '')).getHours() < 12;
    });
  }, [appointments]);

  const afternoonAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date.replace('.000Z', '')).getHours() >= 12;
    });
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    return appointments.find(appointment =>
      isAfter(parseISO(appointment.date), new Date()),
    );
  }, [appointments]);

  const deleteAgendamento = async (id: any) => {
    try {
      await api.delete(`/appointments/cancel?id=${id}`);
      getAppointments();
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <S.Container>
      <S.Header>
        <S.HeaderContent>
          <img src={logoImg} alt="Logo GoBarber" />
          <S.HeaderProfile>
            <img
              src={
                user.avatar_url ||
                'https://www.esfri.eu/sites/default/files/profileImage_nonGender-220.png'
              }
              alt={user.name}
            />

            <div>
              <span>Bem-vindo,</span>
              <Link to="/profile">
                <strong>{user.name}</strong>
              </Link>
              {user.descricao ? <Link to="/descricao">
                <span> {user.descricao}</span>
              </Link> : <Link to="/descricao">
                <span> <FiEdit  /> Definir descrição</span>
              </Link>}
              <span>Avaliação: 5/5</span>
            </div>
          </S.HeaderProfile>
          <button type="button" onClick={signOut}>
            <FiPower size={20} />
          </button>
        </S.HeaderContent>
        
      </S.Header>
      {user.roles.includes('ROLE_ADMIN') && <S.Content>
        <Link to="/clientes" style={{ minWidth: '100%' }}>
          <Button>
            Listagem de clientes 
          </Button>
        </Link>
      </S.Content>}        
      

      <S.Content>
        <S.Schedule>
          <h1>Horários agendados</h1>
          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectedDateAsText}</span>
            <span>
              {selectedWeekDay.includes('domingo') ||
              selectedWeekDay.includes('sábado')
                ? `${selectedWeekDay}`
                : `${selectedWeekDay}-feira`}
            </span>
          </p>

          {!isValid && (
            <div className="alert alert-danger" role="alert">
              Sua conta está desativada, para ativar entre em contato com (32)
              98803-5580.
            </div>
          )}

          {!isOpenAppointment && isValid ? (
            <S.Agendar>
              <Button
                style={{ width: '45.5vw' }}
                onClick={() => setisOpenAppointment(!isOpenAppointment)}
              >
                <FiClock size={18} /> Agendar
              </Button>
            </S.Agendar>
          ) : null}

          {isOpenAppointment && (
            <Form
              style={{ marginTop: 20 }}
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <Input name="nome" icon={FiUser} placeholder="Nome" />
              <Input
                type="date"
                name="data_agendamento"
                icon={FiCalendar}
                placeholder="Data de Agendamento"
              />
              <Input
                type="time"
                name="hora_agendamento"
                icon={FiCalendar}
                placeholder="Hora de Agendamento"
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <Button onClick={() => setisOpenAppointment(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Agendar</Button>
              </div>
            </Form>
          )}

          {isToday(selectedDate) && nextAppointment && (
            <S.NextAppointment>
              <strong>Atendimento a seguir</strong>
              <div>
                <img
                  src={
                    nextAppointment.user.avatar_url ||
                    'https://api.adorable.io/avatars/80/abott@adorable.io.png'
                  }
                  alt={nextAppointment.user.name}
                />

                <strong>{nextAppointment.user.name}</strong>
                <span>
                  <FiClock size={24} />
                  {nextAppointment.hourFormatted}
                </span>
              </div>
            </S.NextAppointment>
          )}

          <S.Section>
            <strong>Manhã</strong>

            {morningAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {morningAppointments.map(appointment => (
              <S.Appointment key={appointment.id}>
                <span>
                  <FiClock size={20} />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <img
                    src={
                      appointment.user.avatar_url ||
                      'https://api.adorable.io/avatars/56/abott@adorable.io.png'
                    }
                    alt={appointment.user.name}
                  />

                  <strong style={{ width: '100%' }}>
                    {appointment.user.name}
                  </strong>
                  <Button
                    style={{
                      width: 50,
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => deleteAgendamento(appointment.id)}
                  >
                    <FiXCircle size={20} />
                  </Button>
                </div>
              </S.Appointment>
            ))}
          </S.Section>
          <S.Section>
            <strong>Tarde</strong>

            {afternoonAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {afternoonAppointments.map(appointment => (
              <S.Appointment key={appointment.id}>
                <span>
                  <FiClock size={20} />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <img
                    src={
                      appointment.user.avatar_url ||
                      'https://api.adorable.io/avatars/56/abott@adorable.io.png'
                    }
                    alt={appointment.user.name}
                  />

                  <strong style={{ width: '100%' }}>
                    {appointment.user.name}
                  </strong>
                  <Button
                    style={{
                      width: 50,
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => deleteAgendamento(appointment.id)}
                  >
                    <FiXCircle size={20} />
                  </Button>
                </div>
              </S.Appointment>
            ))}
          </S.Section>
        </S.Schedule>
        <S.Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }, ...disableDays]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            onMonthChange={handleMonthChange}
            selectedDays={selectedDate}
            onDayClick={handleDateChange}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </S.Calendar>
        
      </S.Content>
    </S.Container>
  );
};

export default Dashboard;
