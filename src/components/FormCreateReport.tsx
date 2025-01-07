import { useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { Form, Input, Select, Button, DatePicker, Upload, message, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const FormCreateReport = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (info: { file: UploadFile<unknown> }) => {
    setFile(info.file as unknown as File);
    console.log('Selected File:', info.file);
  };

  const onFinish = async (values: { [key: string]: unknown }) => {
    if (!file) {
      console.error('No file selected');
      message.error('Harap unggah bukti penyaluran!');
      return;
    }

    console.log('File ready for submission:', file);

    const formData = new FormData();
    formData.append('programId', values.programId as string);
    formData.append('recipientCount', values.recipientCount as string);
    formData.append('region', values.region as string);
    formData.append('distributionDate', (values.distributionDate as moment.Moment).format('YYYY-MM-DD'));
    formData.append('note', values.note as string);
    formData.append('proof', file);

    try {
      const response = await axios.post('http://localhost:3000/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Laporan berhasil disubmit!');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
      message.error('Terjadi kesalahan saat mengirim laporan.');
    }
    navigate('/reports')
  };

  return (
    <div className="max-w-4xl mx-auto !mt-4 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Form Laporan Penyaluran</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item label="Nama Program" name="programId" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Select placeholder="Pilih Program" className="border-gray-300 rounded-lg">
            <Select.Option value="1">PKH</Select.Option>
            <Select.Option value="2">BLT</Select.Option>
            <Select.Option value="3">Bansos</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="Jumlah Penerima" name="recipientCount" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input type="number" className="border-gray-300 rounded-lg" />
        </Form.Item>

        <Form.Item label="Wilayah" name="region" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input placeholder="Provinsi, Kabupaten, Kecamatan" className="border-gray-300 rounded-lg" />
        </Form.Item>

        <Form.Item label="Tanggal Penyaluran" name="distributionDate" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <DatePicker className="border-gray-300 rounded-lg w-full" />
        </Form.Item>

        <Form.Item label="Bukti Penyaluran" rules={[{ required: true }]}>
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            accept=".jpg,.png,.pdf"
            customRequest={({ file }) => {
              setFile(file as File);
              console.log('Custom Request File:', file);
            }}
            className="border-gray-300 rounded-lg"
          >
            <Button icon={<UploadOutlined />} className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg">Unggah File</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Catatan Tambahan" name="note">
          <Input.TextArea rows={3} className="border-gray-300 rounded-lg" />
        </Form.Item>

        <div className="text-center mt-6">
          <Button type="primary" htmlType="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Kirim</Button>
        </div>
      </Form>
    </div>
  );
};

export default FormCreateReport;
