import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../Utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ['events', params.id] }); //this will cancel all specific query related to particular queryKey
      const previousEvent = queryClient.getQueryData(['events', params.id]);

      queryClient.setQueryData(['events', params.id], newEvent);

      return { previousEvent };
    },
    onError: (error, data, context) => { //while executing query if we have an error then handle it inside this block
      queryClient.setQueryData(['events', params.id], context.previousEvent);
    },
    onSettled: () => {// this block is executed after a query pass or failed it's like finally block
      queryClient.invalidateQueries(['events', params.id]);
    }
  });


  function handleSubmit(formData) {
    mutate({id:params.id, event:formData});
    navigate('../');
   }

  function handleClose() {
    navigate('../');
  }

  let context;

  if (isPending) {
    context = <p>Loading Data Please Wait...</p>
  }

  if (isError) {
    context = <ErrorBlock title={'Something went wrong'} message={error.info?.message || 'Error in Data Fetching!'} />
  }

  if (data) {
    context = <EventForm inputData={data} onSubmit={handleSubmit}>
      <Link to="../" className="button-text">
        Cancel
      </Link>
      <button type="submit" className="button">
        Update
      </button>
    </EventForm>
  }

  return (
    <Modal onClose={handleClose}>
      {context}
    </Modal>
  );
}
