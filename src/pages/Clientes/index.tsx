import React, {
    useState,
    useCallback,
    useEffect,
    useMemo,
    useRef,
  } from 'react';
  import { isToday, format, parseISO, isAfter } from 'date-fns';
  import ptBR from 'date-fns/locale/pt-BR';
  import Button from '../../components/Button';
  import 'react-day-picker/lib/style.css';
  import {
    FiPower
  } from 'react-icons/fi';
  import { FaUserEdit } from "react-icons/fa";
  import { Link, useHistory } from 'react-router-dom';
  import * as S from './styles';
  
  import logoImg from '../../assets/logo.svg';
  import { useAuth } from '../../hooks/auth';
  import api from '../../services/api';

  interface Users {
    id: number;
    nome: string;
    email: string;
    atuacao: string;
    validade: Date;
  }

  const Dashboard: React.FC = () => {
    const { signOut, user } = useAuth();
    const history = useHistory();
    const [usersList, setUsersList] = useState<Users[]>([]);

    function Editar(id){
      history.push('/alterar-validade/' + id)
    }
    useEffect(() => {
        const isAdmin = user.roles.includes("ROLE_ADMIN")
        if(!isAdmin) history.push('/')
      }, []);

      useEffect(() => {
        api
          .get<Users[]>('/providers/lista')
          .then(response => {
            setUsersList(response.data);
          });
      }, []);
  
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
              </div>
            </S.HeaderProfile>
            <button type="button" onClick={signOut}>
              <FiPower size={20} />
            </button>
          </S.HeaderContent>
          
        </S.Header>
  
        <S.Content>
            <h2>Listagem de Usuários</h2>
            <S.Table>
            <tr style={{textAlign: 'left'}}>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Área de Atuação</th>
                <th>Validade</th>
                <th>Ações</th>
            </tr>
            {usersList.map((user, index) => {
              let validade = new Date(user.validade)
              return (
                <tr key={index}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.atuacao}</td>
                  <td>{format(validade, 'Pp', { locale: ptBR })}</td>
                  <td>
                    <Button
                    style={{height: '30px'}}
                      onClick={() => Editar(user.id)}
                    >
                      <FaUserEdit size={18} /> Editar Validade
                    </Button>
                  </td>
                </tr>
              )
            })}
            
            </S.Table>
          
        </S.Content>
      </S.Container>
    );
  };
  
  export default Dashboard;
  