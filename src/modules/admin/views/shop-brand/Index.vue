<template>
  <div class="box">
    <div class="box-toolbar">
      <div class="box-toolbar-search">
        <search-form v-if="searchFields" :search-fields="searchFields" />
      </div>
      <div class="box-toolbar-button">
        <el-button
          :disabled="!$can('shop-brand/create')"
          type="primary"
          size="medium"
          @click="handleShopBrandCreate()"
        >
          新建品牌
        </el-button>
      </div>
    </div>
    <el-row :gutter="12">
      <el-col
        :span="6"
        v-for="shopBrand in shopBrands"
        v-bind:key="shopBrand.id"
      >
        <el-card shadow="hover" :body-style="{ padding: '10px' }">
          <img
            width="88"
            height="31"
            :alt="shopBrand.name"
            v-if="shopBrand.logo"
            :src="shopBrand.logo"
            class="brand-logo"
          />
          <img :alt="shopBrand.name" v-else src="" class="image" />
          <div style="padding: 10px 0; text-align: center">
            <div>
              <ag-icon v-if="shopBrand.icon" :path="shopBrand.icon" />
              <i v-else class="el-icon-folder" />
              <span>{{ shopBrand.name }}</span>
            </div>
            <div class="bottom clearfix">
              <el-button
                type="primary"
                size="mini"
                plain
                class="button"
                @click="handleShopBrandEdit(shopBrand)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                size="mini"
                plain
                class="button"
                @click="handleShopBrandDelete(shopBrand)"
                >删除</el-button
              >
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
      :title="this.dialogTitle"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form
        v-if="formModel"
        ref="formModel"
        :model="formModel"
        label-width="100px"
        label-suffix="："
        @submit.native.stop.prevent="handleFormSubmit('formModel')"
      >
        <el-form-item
          label="名称"
          prop="name"
          :rules="[
            {
              required: true,
              message: '请输入品牌名称',
              trigger: 'blur'
            }
          ]"
        >
          <el-col :md="10">
            <el-input v-model.trim="formModel.name" />
          </el-col>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-col :md="20">
            <el-input
              placeholder="请填写 SVG 图标的 PATH 节点"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 5 }"
              v-model.trim="formModel.icon"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="LOGO" prop="logo">
          <el-col :md="10">
            <image-upload
              v-model="formModel.logo"
              :preview="[176, 62]"
              :multiple="false"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="介绍" prop="description">
          <el-col :md="20">
            <el-input
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
              v-model.trim="formModel.description"
            />
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            size="small"
            :loading="submitLoading"
          >
            确定
          </el-button>
          <el-button @click="dialogVisible = false" size="small"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import AgIcon from '@core/components/Icon'
import ShopBrandService from '@admin/services/ShopBrandService'
import flatry from '@core/utils/flatry'
import SearchFormFieldsMixin from '@admin/mixins/SearchFormFieldsMixin'
import SearchForm from '@admin/components/SearchForm'
import ImageUpload from '@admin/components/upload/ImageUpload'
import UnprocessableEntityHttpErrorMixin from '@admin/mixins/UnprocessableEntityHttpErrorMixin'

export default {
  components: { ImageUpload, SearchForm, AgIcon },
  mixins: [SearchFormFieldsMixin, UnprocessableEntityHttpErrorMixin],
  data() {
    return {
      loading: true,
      submitLoading: false,
      shopBrands: [],
      dialogVisible: false,
      dialogTitle: '',
      formModel: null
    }
  },
  created() {
    this.getShopBrands()
  },
  watch: {
    $route: 'getShopBrands'
  },
  methods: {
    async getShopBrands() {
      this.loading = true

      const { data } = await flatry(
        ShopBrandService.all(this.buildRouteQuery(this.$route.query))
      )

      if (data) {
        this.shopBrands = data.items

        this.setSearchFields(data.searchFields)
      }

      this.loading = false
    },
    handleShopBrandCreate() {
      this.dialogTitle = '新建品牌'
      this.dialogVisible = true
      this.formModel = {
        id: 0,
        name: '',
        icon: '',
        logo: '',
        description: ''
      }
    },
    handleFormSubmit(formName) {
      const self = this

      self.$refs[formName].validate(async valid => {
        if (!valid) {
          return false
        }

        self.submitLoading = true

        const editShopBrandId = self.formModel.id

        const { data, error } = await flatry(
          editShopBrandId > 0
            ? ShopBrandService.edit(editShopBrandId, self.formModel)
            : ShopBrandService.create(self.formModel)
        )

        if (data) {
          if (editShopBrandId > 0) {
            self.$message.success('编辑品牌成功')
            this.shopBrands.forEach((item, index) => {
              if (item.id === editShopBrandId) {
                this.$set(this.shopBrands, index, data)
              }
            })
          } else {
            self.$message.success('新建品牌成功')
            self.shopBrands.push(data)
          }
        }

        if (error) {
          self.handleViolationError(error, formName)
        }

        self.submitLoading = false
        self.dialogVisible = false
      })
    },
    handleShopBrandEdit(shopBrand) {
      this.dialogTitle = '编辑品牌'
      this.dialogVisible = true
      this.formModel = Object.assign({}, shopBrand)
    },
    handleShopBrandDelete(shopBrand) {
      this.$deleteDialog({
        message: `你确定要删除品牌 <strong>${shopBrand.name}</strong> 吗`,
        callback: async () => {
          this.loading = true

          const { data } = await flatry(ShopBrandService.delete(shopBrand.id))

          if (data) {
            this.shopBrands.forEach((item, index) => {
              if (item.id === shopBrand.id) {
                this.shopBrands.splice(index, 1)
              }
            })

            this.$message({
              type: 'success',
              message: '删除成功'
            })
          }

          this.loading = false
        }
      })
    }
  }
}
</script>
<style lang="scss">
.brand-logo {
  border: 1px solid #dddddd;
}
</style>