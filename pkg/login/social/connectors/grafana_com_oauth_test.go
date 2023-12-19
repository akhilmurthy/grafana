package connectors

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/login/social"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	ssoModels "github.com/grafana/grafana/pkg/services/ssosettings/models"
	"github.com/grafana/grafana/pkg/services/ssosettings/ssosettingstests"
	"github.com/grafana/grafana/pkg/setting"
)

const (
	UserInfoURL  = "/api/oauth2/user"
	userResponse = `{
		"id": 123,
		"name": "grafana name",
		"login": "grafanalogin",
		"username": "grafanalogin",
		"email": "grafana@grafana.com",
		"role": "Admin",
		"orgs": [    {      "login": "grafana",      "role": "Admin"    } ]
	}`
)

func TestSocialGrafanaCom_UserInfo(t *testing.T) {
	provider := NewGrafanaComProvider(social.NewOAuthInfo(), &setting.Cfg{}, &ssosettingstests.MockService{}, featuremgmt.WithFeatures())

	type conf struct {
		skipOrgRoleSync bool
	}

	tests := []struct {
		Name          string
		Cfg           conf
		userInfoResp  string
		want          *social.BasicUserInfo
		ExpectedError error
	}{
		{
			Name:         "should return empty role as userInfo when Skip Org Role Sync Enabled",
			userInfoResp: userResponse,
			Cfg:          conf{skipOrgRoleSync: true},
			want: &social.BasicUserInfo{
				Id:    "1",
				Name:  "Eric Leijonmarck",
				Email: "octocat@github.com",
				Login: "octocat",
				Role:  "",
			},
		},
		{
			Name:         "should return role as userInfo when Skip Org Role Sync Enabled",
			userInfoResp: userResponse,
			Cfg:          conf{skipOrgRoleSync: false},
			want: &social.BasicUserInfo{
				Id:    "1",
				Name:  "Eric Leijonmarck",
				Email: "octocat@github.com",
				Login: "octocat",
				Role:  "Admin",
			},
		},
	}

	for _, test := range tests {
		provider.info.SkipOrgRoleSync = test.Cfg.skipOrgRoleSync

		t.Run(test.Name, func(t *testing.T) {
			ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				w.Header().Set("Content-Type", "application/json")
				switch r.RequestURI {
				case UserInfoURL:
					_, err := w.Write([]byte(test.userInfoResp))
					require.NoError(t, err)
				default:
					w.WriteHeader(http.StatusNotFound)
				}
			}))
			provider.url = ts.URL
			actualResult, err := provider.UserInfo(context.Background(), ts.Client(), nil)
			if test.ExpectedError != nil {
				require.Equal(t, err, test.ExpectedError)
				return
			}

			require.NoError(t, err)
			require.Equal(t, test.want.Role, actualResult.Role)
		})
	}
}

func TestSocialGrafanaCom_InitializeExtraFields(t *testing.T) {
	type settingFields struct {
		allowedOrganizations []string
	}
	testCases := []struct {
		name     string
		settings *social.OAuthInfo
		want     settingFields
	}{
		{
			name:     "allowedOrganizations is not set",
			settings: social.NewOAuthInfo(),
			want: settingFields{
				allowedOrganizations: []string{},
			},
		},
		{
			name: "allowedOrganizations is set",
			settings: &social.OAuthInfo{
				Extra: map[string]string{
					"allowed_organizations": "uuid-1234,uuid-5678",
				},
			},
			want: settingFields{
				allowedOrganizations: []string{"uuid-1234", "uuid-5678"},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			s := NewGrafanaComProvider(tc.settings, &setting.Cfg{}, &ssosettingstests.MockService{}, featuremgmt.WithFeatures())

			require.Equal(t, tc.want.allowedOrganizations, s.allowedOrganizations)
		})
	}
}

func TestSocialGrafanaCom_Validate(t *testing.T) {
	testCases := []struct {
		name        string
		settings    ssoModels.SSOSettings
		expectError bool
	}{
		{
			name: "SSOSettings is valid",
			settings: ssoModels.SSOSettings{
				Settings: map[string]any{
					"client_id":     "client-id",
					"client_secret": "client-secret",
				},
			},
			expectError: false,
		},
		{
			name: "fails if settings map contains an invalid field",
			settings: ssoModels.SSOSettings{
				Settings: map[string]any{
					"client_id":     "client-id",
					"client_secret": "client-secret",
					"invalid_field": []int{1, 2, 3},
				},
			},
			expectError: true,
		},
		{
			name: "fails if client id is empty",
			settings: ssoModels.SSOSettings{
				Settings: map[string]any{
					"client_id":     "",
					"client_secret": "client-secret",
				},
			},
			expectError: true,
		},
		{
			name: "fails if client id does not exist",
			settings: ssoModels.SSOSettings{
				Settings: map[string]any{
					"client_secret": "client-secret",
				},
			},
			expectError: true,
		},
		{
			name: "fails if client secret is empty",
			settings: ssoModels.SSOSettings{
				Settings: map[string]any{
					"client_id":     "client-id",
					"client_secret": "",
				},
			},
			expectError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			s := NewGrafanaComProvider(&social.OAuthInfo{}, &setting.Cfg{}, &ssosettingstests.MockService{}, featuremgmt.WithFeatures())

			err := s.Validate(context.Background(), tc.settings)
			if tc.expectError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
