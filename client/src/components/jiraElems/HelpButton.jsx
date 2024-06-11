import { useEffect, useState } from 'react';
import { Tooltip } from 'bootstrap';
import TicketForm from './TicketForm';

import '../../styles/bootstrp.css';

export default function HelpButton() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map((tt) => new Tooltip(tt));
  }, []);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <div className=''>
      <button
        type='button'
        className='btn btn-secondary help-button rounded-circle fixed-bottom position-fixed mb-5 z-3'
        id='enforce-right'
        data-bs-toggle='tooltip'
        data-bs-placement='left'
        data-bs-title='Create a Support Ticket'
        onClick={handleShow}
      >
        <i className='bi bi-question-circle'></i>
      </button>
      <TicketForm show={showModal} handleClose={handleClose} />{' '}
    </div>
  );
}
