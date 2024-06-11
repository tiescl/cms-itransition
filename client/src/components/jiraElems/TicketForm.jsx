import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import getHumanReadableError from '../../utils/getHumanReadableError';

export default function TicketForm({ show, handleClose }) {
  const [formData, setFormData] = useState({
    summary: '',
    priority: 'Average',
    collection: '',
    link: window.location.href
  });
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
    const token = localStorage.getItem('auth');

    if (!formData.summary.trim()) {
      setError('Summary is required.');
      return;
    }
    if (!formData.priority) {
      setError('Priority is required.');
      return;
    }

    setError('');

    try {
      const response = await fetch(`${prodUrl}/api/create-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          summary: formData.summary.trim(),
          collection: formData.collection?.trim()
        })
      });

      if (response.ok) {
        setShowAlert(true);
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (err) {
      setError(getHumanReadableError(err.message));
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop='static'
      className='modal-fullscreen-sm-down'
    >
      <Modal.Header closeButton>
        <Modal.Title>Create Support Ticket</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className='fs-5'>
          <Form.Group controlId='summary' className='mb-3'>
            <Form.Label>Summary (Required)</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='summary'
              value={formData.summary}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId='priority' className='mb-3'>
            <Form.Label>Priority (Required)</Form.Label>
            <Form.Control
              as='select'
              name='priority'
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value='Highest'>Highest</option>
              <option value='High'>High</option>
              <option value='Medium'>Medium</option>
              <option value='Low'>Low</option>
              <option value='Lowest'>Lowest</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId='collection' className='mb-4'>
            <Form.Label>Collection (Optional)</Form.Label>
            <Form.Control
              type='text'
              name='collection'
              value={formData.collection}
              onChange={handleChange}
            />
          </Form.Group>

          {showAlert && (
            <Alert
              variant='info'
              onClose={() => setShowAlert(false)}
              dismissible
            >
              Ticket created successfully!
            </Alert>
          )}

          {error && <p className='text-danger mt-1'>{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button variant='primary' type='submit' onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
