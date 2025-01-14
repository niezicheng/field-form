import React from 'react';
import Form, { Field, FormInstance } from 'rc-field-form';
import Input from './components/Input';

const list = new Array(1111).fill(() => null);

interface FormValues {
  username?: string;
  password?: string;
  path1?: {
    path2?: string;
  };
}

export default class Demo extends React.Component {
  formRef: any = React.createRef<FormInstance<FormValues>>();

  onFinish = (values: FormValues) => {
    console.log('Submit:', values);

    setTimeout(() => {
      this.formRef.current.setFieldsValue({ path1: { path2: '2333' } });
    }, 500);
  };

  componentDidMount(): void {
    console.log(this.formRef.current.getFieldsValue(), 'this.formRef.getFieldsValue();')
  }


  public render() {
    return (
      <div>
        <h3>State Form ({list.length} inputs)</h3>
        <Form<FormValues> ref={this.formRef} onFinish={this.onFinish}>
          <Field name="username">
            <Input placeholder="Username" />
          </Field>
          <Field name="password">
            <Input placeholder="Password" />
          </Field>
          <Field name="username">
            <Input placeholder="Shadow of Username" />
          </Field>
          <Field name={['path1', 'path2']}>
            <Input placeholder="nest" />
          </Field>
          <Field name={['renderProps']}>
            {control => (
              <div>
                I am render props
                <Input {...control} placeholder="render props" />
              </div>
            )}
          </Field>

          <button type="submit">Submit</button>

          <h4>Show additional field when `username` is `111`</h4>
          <Field<FormValues> dependencies={['username']}>
            {(control, meta, context) => {
              const { username } = context.getFieldsValue(true);
              console.log('my render!', username);
              return username === '111' && <Input {...control} placeholder="I am secret!" />;
            }}
          </Field>

          {list.map((_, index) => (
            <Field key={index} name={`field_${index}`}>
              <Input placeholder={`field_${index}`} />
            </Field>
          ))}
        </Form>
      </div>
    );
  }
}
