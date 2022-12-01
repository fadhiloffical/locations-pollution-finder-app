import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
  Layout,
  Card,
  Space,
  Form,
  Select,
  Tag,
  Button,
  Modal,
  Row,
  Col,
  Spin,
} from "antd";
import Moment from "moment";
const { Header, Content } = Layout;
function App() {
  const [chooseCityForm] = Form.useForm();
  const [cities, setCities] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCityData, setSelectedCityData] = useState("");
  const [loactionData, setLoactionData] = useState("");
  const [spinnerState, setSpinnerState] = useState("");

  useEffect(() => {
    getCities();
  }, []);
  const getCities = async () => {
    await axios
      .get(
        "https://api.openaq.org/v2/locations?country_id=IN&limit=9999&sort=asc&order_by=city"
      )
      .then(function (response) {
        if (response.data) {
          setCities(response?.data?.results);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    setCityList(
      cities?.map((data, i) => ({
        value: i,
        label: data.name,
      }))
    );
  }, [cities]);

  const onChange = (value) => {
    console.log(cities[value]);
    setSelectedCityData(cities[value]);
  };
  const getLocationData = async () => {
    setSpinnerState(true);
    await axios
      .get(`https://api.openaq.org/v2/locations/${selectedCityData?.id}`)
      .then(function (response) {
        if (response.data) {
          setLoactionData(response?.data?.results[0]);
          setSpinnerState(false);
        }
      })
      .catch(() => {
        setSpinnerState(false);
      });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    getLocationData();
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <Layout>
        <Layout style={{ padding: "24px 24px" }}>
          <Content className="site-layout-background">
            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex" }}
            >
              <Card title="Choose a city" size="small" className="full-width">
                <Form form={chooseCityForm} name="control-hooks">
                  <Form.Item rules={[{ required: true }]}>
                    <Select
                      showSearch
                      placeholder="Select a person"
                      optionFilterProp="children"
                      onChange={onChange}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={cityList}
                    />
                  </Form.Item>
                </Form>
              </Card>
            </Space>
            {selectedCityData && (
              <Space
                direction="vertical"
                size="middle"
                style={{ display: "flex" }}
                className="center"
              >
                <Card
                  title={selectedCityData?.name}
                  style={{
                    width: 500,
                  }}
                >
                  <p className="medium-font bold">
                    Location ID: {selectedCityData?.id}{" "}
                  </p>
                  <p className="medium-font mb">
                    In <i>{selectedCityData?.city}</i>
                  </p>
                  <Tag color="orange">{selectedCityData?.sensorType}</Tag>
                  <Tag color="orange">{selectedCityData?.entity}</Tag>
                  <p>
                    Collection Dates:{" "}
                    {Moment(selectedCityData?.firstUpdated).format("d/mm/yyyy")}{" "}
                    -{" "}
                    {Moment(selectedCityData?.lastUpdated).format("d/mm/yyyy")}
                  </p>
                  <p>Measurements: {selectedCityData?.measurements}</p>
                  <p>
                    Parameters:{" "}
                    {selectedCityData?.parameters.map((parameter, i) => (
                      <i key={i}>{parameter?.displayName}, </i>
                    ))}
                  </p>
                  <p>
                    Source:{" "}
                    <a href={selectedCityData?.sources[0]?.url} target="_blank">
                      {selectedCityData?.sources[0]?.name}
                    </a>
                  </p>
                  <Button type="primary" onClick={showModal}>
                    View More
                  </Button>
                </Card>
              </Space>
            )}
          </Content>
        </Layout>
      </Layout>
      <Modal
        title={loactionData?.name}
        destroyOnClose
        open={isModalOpen}
        onOk={handleOk}
        width={1200}
        onCancel={handleCancel}
      >
        <Spin spinning={spinnerState}>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Details" bordered={true}>
              <p className="large-font">
                {loactionData?.measurements} <br />
                <small>Measurements</small>
              </p>
              <br />
              <br />
              {loactionData?.coordinates?.latitude && (
                <>
                  <p className="bold mb-0">Coordinates</p>{" "}
                  {loactionData?.coordinates?.latitude},{" "}
                  {loactionData?.coordinates?.longitude}
                </>
              )}

              <p className="bold mb-0">Project Collection Dates: </p>
              <i>
                {Moment(loactionData?.firstUpdated).format("d/mm/yyyy")} -{" "}
                {Moment(loactionData?.lastUpdated).format("d/mm/yyyy")}
              </i>
            </Card>
          </Col>
          <Col span={16}>
            <Card title="Latest Measurements" bordered={true}>
              {loactionData?.parameters?.map((parameter, i) => (
                <div className="measurements-card">
                  <i key={i}>{parameter?.displayName}</i>
                  <p className="large-font">{parameter?.lastValue}</p>
                  <p className="bold">{parameter?.unit}</p>
                  <i>
                    {Moment(loactionData?.lastUidated).format("d/mm/yyyy")}
                    {}
                  </i>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
        </Spin>
      </Modal>
    </Layout>
  );
}

export default App;
