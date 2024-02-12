import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../Utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {
  const param = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', param.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: param.id })
  })

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' });
      navigate('/events');
    }
  });

  const deleteHandler = () => {
    mutate({ id: param.id })
  }

  let content;

  if (isPending) {
    content = <>
      <div id="event-details-content">
        <p>Loading....</p>
      </div>
    </>
  }

  if (isError) {
    content = <>
      <div id="event-details-content">
        <ErrorBlock title={'Something Went Wrong'} message={error.info?.message || 'Unable to fetch details!'} />
      </div>
    </>
  }

  if (data) {
    content = <>
      <header>
        <h1>{data.title}</h1>
        <nav>
          <button onClick={deleteHandler}>Delete</button>
          <Link to="edit">Edit</Link>
        </nav>
      </header>

      <div id="event-details-content">
        <img src={`http://localhost:3000/${data.image}`} alt={data.image} />
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
          </div>
          <p id="event-details-description">{data.description}</p>
        </div>
      </div></>
  }
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
