<template>
    <div>
        <el-tabs v-model="currentType" v-if="isCreate" @tab-click="datasourceUpdateComponent = dataSourceUpdateComponentList.find(o => o.type === currentType)" >
            <el-tab-pane v-for="item in dataSourceUpdateComponentList" :key="item.type" :label="item.label" :name="item.type" />
        </el-tabs>

        <el-form label-position="right" label-width="120px" :model="ruleForm" ref="form" size="mini"  >
            <el-form-item :label="$t('connect.type')" prop="type"  v-if="!isCreate" >
                <el-input v-model="(dataSourceUpdateComponentList.find(o => o.type === ruleForm.type) || {}).label" disabled></el-input>
            </el-form-item>
            <el-form-item :label="$t('connect.name')" prop="name" :rules="nameRule">
                <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('project.description')" prop="description">
                <el-input type="textarea" :rows="3" maxlength="120" show-word-limit v-model="ruleForm.description"></el-input>
            </el-form-item>
        </el-form>
        <component v-if="datasourceUpdateComponent" ref="datasourceUpdateComponent" :is="datasourceUpdateComponent.component" />
    </div>
</template>

<script>
import dataSourceRepository from "@/renderer/api/DataSourceRepositoryClient.js";
import projectManager 			from '@/renderer/core/project/index.js'

export default {
    data() {
        return {
            currentType: "",
            isCreate : true,
            ruleForm: {},
            dataSourceUpdateComponentList: [],
            datasourceUpdateComponent: null,

        };
    },
    props: {
        id: String,
        onSaveSuccess: Function
    },
    watch: {
        id: {
            handler() {
                this.init();
            },
        }
    },
    computed: {
        nameRule(){
            return [
                { required: true, message: this.$t('connect.validateMessage.inputName'), trigger: "blur" },
                {
                    min: 1,
                    max: 32,
                    message: this.$t('connect.validateMessage.rangeLimit'),
                    trigger: "blur",
                },
            ];
        } 
    },
    async mounted() {
        this.dataSourceUpdateComponentList = projectManager.getProjectUpdateComponentList();
        if (!this.dataSourceUpdateComponentList.length) {
            return;
        }
        this.datasourceUpdateComponent = this.dataSourceUpdateComponentList[0];
        this.currentType = this.dataSourceUpdateComponentList[0].type;
        this.init();
    },
    methods: {
        dialogActions(dialogHelper) {
            return [
                {
                    text: this.$t('base.confirm'),
                    type: 'primary',
                    click: async (done) => {
                        if(await this.saveDataSourceInfo()) {
                            done();
                        }
                    },
                },
                dialogHelper.getDefaultCancelButton(),
            ];
        },
        async init() {
            if (!this.dataSourceUpdateComponentList.length) {
                return;
            }
            this.isCreate = this.id ? false : true;

            if (this.id) {
                this.ruleForm = await dataSourceRepository.findById(this.id) || {};
                this.ruleForm.description = this.ruleForm.description || "";
                this.currentType = this.ruleForm.type;
                this.datasourceUpdateComponent = this.dataSourceUpdateComponentList.find(o => o.type === this.currentType) || this.dataSourceUpdateComponentList[0];
            } else {
                this.datasourceUpdateComponent = this.dataSourceUpdateComponentList.find(o => o.type === this.currentType) || this.dataSourceUpdateComponentList[0];
                this.currentType = this.datasourceUpdateComponent.type;
                this.ruleForm = {
                    description: ""
                };
            }  

            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.clearValidate();
                this.$refs.datasourceUpdateComponent && this.$refs.datasourceUpdateComponent.init({...this.ruleForm});
            })
        },
        saveDataSourceInfo() {
            return new Promise((resolve) => {
                this.$refs.form.validate(async (valid) => {
                    if (!valid) {
                        resolve(false);
                        return;
                    }

                    const properties = await this.$refs.datasourceUpdateComponent.getDataSourceInfo();
                    if(!properties ||  typeof properties !== 'object'){
                        resolve(false);
                        return;
                    }

                    const dataSourceInfo = {
                        ...properties,
                        _id: this.ruleForm._id,
                        name: this.ruleForm.name,
                        description: this.ruleForm.description,
                        type: this.isCreate ? this.datasourceUpdateComponent.type :this.ruleForm.type,
                    }

                    await dataSourceRepository.save(dataSourceInfo);

                    this.$message({
                        type: "success",
                        message: this.isCreate ? this.$t('connect.createSuccess') : this.$t('connect.updateSuccess'),
                    });

                    if (this.onSaveSuccess) {
                        this.onSaveSuccess(dataSourceInfo);
                    } else {
                        this.$emit("saveSuccess", dataSourceInfo);
                    }
                    resolve(true);
                });
            });
        }
    },
};
</script>
