<template>
  <div class="text-center">
    <v-dialog
      v-model="openDialog"
      persistent
      transition="fab-transition"
      max-width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="red lighten-2"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Click Me
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Secret Channel
        </v-card-title>

        <v-card-text style="margin-top: 15px">
          {{ secretStatus ? 'Are you sure you want to open the secret channel?' : 'Are you sure you want to close the secret channel?' }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="closeModal"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="secretSetting"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

export default {
  name: 'SecretModal',
  props: ['openDialog', 'secretStatus'],
  data: function() {
    return {
      // dialog: true,
    }
  },
  computed: {
    
  },
  methods: {
    closeModal() {
      this.$emit('closeDialog');
    },
    secretSetting() {
      this.$emit('secretSetting', this.secretStatus);
    }
  },
  mounted() {
    
  }
}
</script>
