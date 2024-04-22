import React from 'react';
import Podarc from './Formarc'; 

const TestPodarc = () => {
  const validators = [
    {
      name: 'user.name',
      validator: val => val ? val?.length > 8 : false,
      errorMessage: 'Name field should have more than 8 characters...'
    },
    {
      name: 'user.name',
      validator: val => val.length < 20,
      errorMessage: 'Name field should have less than 20 characters...'
    },
    {
      name: 'email',
      validator: val => val ? val?.length > 7 : false,
      errorMessage: 'Email field should have more than 7 characters...'
    }
  ]
  ///////
  // THE OTHER WAY OF IMPLEMENTING VALIDATORS - DON'T FORGET TO ADAPT THIS ACCORDING TO SETERRORMSH FUNC
  ///////
  // const validators = [
  //   {
  //     name: 'user.name',
  //     validate: (value) => {
  //       if (!value) {
  //         return 'Name is required.';
  //       }
  //       if (value.length < 8) {
  //         return 'Name should have at least 8 characters.';
  //       }
  //       if (value.length > 20) {
  //         return 'Name should have less than 20 characters.';
  //       }
  //       return ''; // No error
  //     }
  //   }
  // ];

  ////////
  // THE OTHER WAY OF IMPLEMENTING VALIDATION - VALIDATE FUNCTION AS IT IS USED IN FORMIK(PASSING VALIDATE FUNCTION AS PROP TO FORMIK COMPONENT)
  ///////
  // const validate = (values) => {
  //   let errors = {};
  //   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  //   if (!values.email) {
  //     errors.email = "Email is required";
  //   } else if (!regex.test(values.email)) {
  //     errors.email = "Invalid Email";
  //   }
  //   if (!values.password) {
  //     errors.password = "Password is required";
  //   } else if (values.password.length < 4) {
  //     errors.password = "Password too short";
  //   }
  //   return errors;
  // };


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
