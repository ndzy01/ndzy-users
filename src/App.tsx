import { useMount, useSetState, useSize } from 'ahooks';
import { Button, Table, List, Form, Input, Row, Col, Space, DatePicker } from 'antd';
import type { TableProps } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useRef } from 'react';
import dayjs from 'dayjs';
import service from './http';

const { RangePicker } = DatePicker;
const App = () => {
  const [form] = Form.useForm();
  const ContainerHeight = 600;
  const ref = useRef(null);
  const size = useSize(ref);
  const [s, setS] = useSetState<{ list: any[]; loading: boolean }>({ list: [], loading: false });
  const span = Number(size?.width) > 800 ? 8 : 24;

  const query = (params: any = {}) => {
    setS({ loading: true });
    service({ url: '/users', method: 'GET', params })
      .then((res: any) => {
        setS({
          list: res.data,
          loading: false,
        });
      })
      .catch(() => {
        setS({ loading: false });
      });
  };

  useMount(() => {
    query();
  });

  const columns: TableProps<any>['columns'] = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 60,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 100,
    },
  ];

  return (
    <div ref={ref} style={{ height: '100%' }}>
      <Form
        form={form}
        name="search"
        onFinish={(values: any) => {
          Object.keys(values).map((item) => {
            if (!values[item]) {
              delete values[item];
            }
            if (item === 'createdRange' || item === 'updatedRange') {
              if (values[item]) {
                values[item] = JSON.stringify(values[item].map((item: any) => dayjs(item).format('YYYY-MM-DD')));
              }
            }
          });
          query(values);
        }}
        scrollToFirstError
      >
        <Row gutter={24}>
          <Col span={span}>
            <Form.Item name="mobile" label="手机号">
              <Input className="w-100" allowClear />
            </Form.Item>
          </Col>
          <Col span={span}>
            <Form.Item name="name" label="名称">
              <Input className="w-100" allowClear />
            </Form.Item>
          </Col>
          <Col span={span}>
            <Form.Item name="createdRange" label="创建时间">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={span}>
            <Form.Item name="updatedRange" label="更新时间">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={span}>
            <Space>
              <Button loading={s.loading} type="primary" htmlType="submit">
                搜索
              </Button>

              <Button
                type="link"
                onClick={() => {
                  form.resetFields();
                  query();
                }}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {Number(size?.width) > 800 ? (
        <Table
          loading={s.loading}
          virtual
          columns={columns}
          scroll={{ x: 800, y: 600 }}
          rowKey="mobile"
          dataSource={s.list}
          pagination={false}
          locale={{ emptyText: <div className="center">暂无用户</div> }}
        />
      ) : (
        <List loading={s.loading}>
          <VirtualList data={s.list} height={ContainerHeight} itemHeight={40} itemKey="mobile">
            {(item) => (
              <List.Item key={item.mobile}>
                <List.Item.Meta title={item.mobile} description={item.name} />
              </List.Item>
            )}
          </VirtualList>
        </List>
      )}
    </div>
  );
};

export default App;
