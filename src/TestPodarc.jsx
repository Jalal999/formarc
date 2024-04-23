import React from 'react';
import Podarc from './Formarc'; 

const TestPodarc = () => {
  const validators = [
    {
      name: 'user.name',
      min: {
        value: 2, 
        error: 'Should have at least 2 characters...'
      },
      max: {
        value: 8, 
        error: 'Should have at least 8 characters...'
      },
    },
    {
      name: 'password',
      minLength: {
        value: 5, 
        error: 'Should have at least 5 characters...'
      },
      maxLength: {
        value: 8,
        error: 'Should have at least 12 characters...'
      },
    },
    {
      name: 'email',
      pattern: {
        regex: '',
        error: 'email should follow pattern'
      },
    }
  ]

  const fields = [
    {
      type: 'text',
      name: 'name',
      required: true,
      label: 'Name',
      // display: 'nested',
      value: 'dfs',
      ignoreFor: 'edit'
    },
    {
      type: 'text',
      name: 'user.surname',
      required: true,
      label: 'Surname',
      display: 'nested',
      disabled: true,
      value: "test", //when it is removed, it will throw error because disabled field should have a value(either passed as here in property, or in initialValues, or in formValues)
    },
    {
      type: 'text',
      name: 'email',
      required: true,
      label: 'Email',
    },
    {
      type: 'text',
      name: 'password',
      required: true,
      label: 'Password',
      visibleIf: (formValues) => formValues.email
    },
    {
      type: 'selectbox',
      name: 'city',
      required: true,
      items: [
        { id: 1, name: 'New York' },
        { id: 2, name: 'London' },
        { id: 3, name: 'Tokyo' },
      ],
      label: 'City',
      visibleIf: (formValues) => formValues.user.name
    }
  ];

  const handleSubmit = () => {
    console.log('Form submitted!');
    // Add any additional logic after form submission if needed(for ex: navigate)
  };

  return (
    <div>
      <h1>Test Podarc Form</h1>
      <Podarc
        type='edit'
        inputs={fields}
        validators={validators}
        initialFormValues={{ test: 'jared', 'user.name': 'jalal' }}
        validateOnSubmit={true}
        onSubmit={handleSubmit}
        apiEndpoint="https://example.com/api/form"
        additionalParams={{
          params: `?filter=test&secondParamTest=value`
        }}
        className="my-form"
        style={{ maxWidth: '400px' }}
        inputClassName="my-input"
        selectClassName="my-select"
        submitClassName="my-submit"
      />
    </div>
  );
};

export default TestPodarc;
