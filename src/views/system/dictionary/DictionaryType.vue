<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="类型代码">
              <a-input v-model="queryParam.code" placeholder="请输入字典类型代码"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="类型名称">
              <a-input v-model="queryParam.name" placeholder="请输入字典类型名称"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleSearch()">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button>
    </div>

    <s-table ref="table" :columns="columns" :data="loadData" :rowKey="(record) => record.id">

      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="handleConfig(record)">配置</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="确认删除?"
          @confirm="handleDelete(record)"
          okText="是"
          cancelText="否"
        >
          <a>删除</a>
        </a-popconfirm>
      </span>
    </s-table>

    <a-modal
      title="操作"
      :width="800"
      v-model="visible"
      @ok="handleOk"
    >
      <a-form :form="this.form">

        <a-form-item
          v-if="false"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="唯一识别码"
          hasFeedback
          validateStatus="success"
        >
          <a-input placeholder="id" v-model="mdl.id" id="no" disabled="disabled" />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="类型代码"
          hasFeedback
          validateStatus="success"
        >
          <a-input placeholder="字典类型代码" v-model="mdl.code" />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="类型名称"
          hasFeedback
          validateStatus="success"
        >
          <a-input placeholder="字典类型名称" v-model="mdl.name" />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="描述"
          hasFeedback
        >
          <a-textarea :rows="5" v-model="mdl.description" placeholder="..." />
        </a-form-item>

      </a-form>
    </a-modal>

    <dict-item-list ref="dictItemList"></dict-item-list>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import DictItemList from './DictItemList'

export default {
  name: 'DictionaryType',
  components: {
    STable,
    DictItemList
  },
  data () {
    return {
      // description: '列表使用场景：后台管理中的权限管理以及角色管理，可用于基于 RBAC 设计的角色权限控制，颗粒度细到每一个操作类型。',

      visible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      form: null,
      mdl: {},

      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '类型代码',
          dataIndex: 'code'
        },
        {
          title: '类型名称',
          dataIndex: 'name'
        },
        {
          title: '描述',
          dataIndex: 'description'
        },
        {
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 向后端拉取可以用的操作列表
      permissionList: null,
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return this.$http.get('/sys_dictionary_types', {
          params: Object.assign(parameter, this.queryParam)
        }).then(res => {
          return res
        })
      },

      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (status) {
      const statusMap = {
        1: '正常',
        2: '禁用'
      }
      return statusMap[status]
    }
  },
  created () {
  },
  methods: {
    handleSearch () {
      console.log('refs', this.$refs)

      this.$refs.table.refresh(true)
    },
    handleAdd () {
      this.mdl = Object.assign({})
      this.visible = true
    },
    handleEdit (record) {
      this.mdl = Object.assign({}, record)
      this.visible = true
    },
    handleConfig (record) {
      this.$refs.dictItemList.edit(record)
    },
    handleOk () {
      if (this.mdl.id) {
        // 修改
        this.$http.put(`/sys_dictionary_types/${this.mdl.id}`, this.mdl).then(result => {
          this.visible = false
          this.$refs.table.refresh(true)
        })
      } else {
        // 新增
        this.$http.post(`/sys_dictionary_types`, this.mdl).then(result => {
          this.visible = false
          this.$refs.table.refresh(true)
        })
      }
    },
    async handleDelete (record) {
      await this.$http.delete(`/sys_dictionary_types/${record.id}`)
      this.handleSearch()
    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    }
  },
  watch: {
    /*
      'selectedRows': function (selectedRows) {
        this.needTotalList = this.needTotalList.map(item => {
          return {
            ...item,
            total: selectedRows.reduce( (sum, val) => {
              return sum + val[item.dataIndex]
            }, 0)
          }
        })
      }
      */
  }
}
</script>
